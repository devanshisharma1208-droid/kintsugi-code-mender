const byId = (id) => document.getElementById(id);
const code = byId('code');
const sample = byId('sample');
const inspector = byId('inspector');
const inspectMode = byId('inspect-mode');
const languages = [...document.querySelectorAll('input[name="language"]')];
const actions = [byId('mend'), byId('polish')];
const requestControls = [...actions, sample, ...languages];
const stageContents = ['cracks', 'trace', 'hint'].map(byId);
const unlockTrace = byId('unlock-trace');
const unlockHint = byId('unlock-hint');
const mascot = document.querySelector('.mascot');
const samples = {
  average: { language: 'C', code: `#include <stdio.h>

int main(void) {
    int marks[] = {53, 65, 70, 91};
    int n = 4;
    int sum;

    for (int i = 0; i <= n; i++) {
        sum += marks[i];
    }

    double average = sum / n;
    printf("Average: %.2f\\n", average);
    return 0;
}` },
  palindrome: { language: 'C', code: `#include <stdio.h>
#include <string.h>

int main(void) {
    const char str[] = "level";
    size_t len = strlen(str);

    for (size_t i = 0; i < len / 2; i++) {
        if (str[i] != str[len - i]) {
            puts("Not a palindrome");
            return 0;
        }
    }

    puts("Palindrome");
    return 0;
}` },
  grade: { language: 'Python', code: `PASS_MARK = 40


def calculate_grade(marks):
    """Return A for 90+, B for 60+, or Pass for 40+."""
    average = sum(marks) / (len(marks) - 1)

    if average > PASS_MARK:
        if average >= 60:
            return "B"
        elif average >= 90:
            return "A"
        return "Pass"
    return "Fail"


print(calculate_grade([92, 95, 91]))` },
};

function requestBody(mode) {
  return { code: code.value, language: languages.find((input) => input.checked).value, mode };
}

function updatePayload() {
  const payload = requestBody(inspectMode.value);
  byId('editor-language').textContent = payload.language;
  byId('payload').textContent = JSON.stringify(payload, null, 2);
}

function syncGutter() {
  byId('line-numbers').style.transform = `translateY(${-code.scrollTop}px)`;
}

function updateEditor() {
  const count = code.value.split('\n').length;
  byId('line-numbers').textContent = Array.from({ length: count }, (_, index) => index + 1).join('\n');
  syncGutter();
  updatePayload();
}

code.addEventListener('input', () => { sample.value = ''; updateEditor(); });
code.addEventListener('scroll', syncGutter);
code.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || code.readOnly) return;
  event.preventDefault();
  code.setRangeText('    ', code.selectionStart, code.selectionEnd, 'end');
  code.dispatchEvent(new Event('input', { bubbles: true }));
});
sample.addEventListener('change', () => {
  const selected = samples[sample.value];
  if (!selected) return;
  code.value = selected.code;
  languages.find((input) => input.value === selected.language).checked = true;
  code.scrollTop = 0;
  code.scrollLeft = 0;
  updateEditor();
});
languages.forEach((input) => input.addEventListener('change', () => {
  sample.value = '';
  updatePayload();
}));
inspectMode.addEventListener('change', updatePayload);
byId('open-inspector').addEventListener('click', () => { updatePayload(); inspector.showModal(); });

function reveal(content, button) {
  content.hidden = false;
  content.closest('.stage').classList.add('unlocked');
  if (button) {
    button.setAttribute('aria-expanded', 'true');
    button.hidden = true;
    content.focus();
  }
}

unlockTrace.addEventListener('click', () => {
  reveal(byId('trace'), unlockTrace);
  unlockHint.disabled = false;
});
unlockHint.addEventListener('click', () => reveal(byId('hint'), unlockHint));

function renderList(container, items) {
  container.replaceChildren(...items.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}

function showResult(mode, result) {
  byId('greeting').textContent = result.kintsu_greeting;
  if (mode === 'mend') {
    const cracks = byId('cracks');
    if (result.cracks.length) {
      const list = document.createElement('ul');
      renderList(list, result.cracks.map(({ line, summary }) => `Line ${line}: ${summary}`));
      cracks.replaceChildren(list);
    } else {
      cracks.textContent = result.is_bug_free ? 'No cracks spotted.' : 'No specific cracks could be confirmed.';
    }
    byId('trace').textContent = result.trace;
    byId('hint').textContent = result.golden_hint;
    reveal(cracks);
    unlockTrace.disabled = false;
    if (result.is_bug_free === true) {
      mascot.classList.add('golden');
      byId('celebration').hidden = false;
    }
  } else {
    byId('polished-code').textContent = result.polished_code;
    renderList(byId('polish-notes'), result.polish_notes);
    byId('copy').textContent = 'Copy Polished Code';
    byId('copy-status').textContent = '';
    byId('glaze').hidden = false;
  }
}

function showError(message) {
  const banner = byId('error');
  banner.textContent = message;
  banner.hidden = false;
}

async function submit(mode) {
  if (actions[0].disabled) return;
  byId('error').hidden = true;
  if (!code.value.trim()) {
    showError('Kintsu needs a little clay to work with. Paste some code or load a cracked sample.');
    code.focus();
    return;
  }

  const body = requestBody(mode);
  inspectMode.value = mode;
  updatePayload();
  stageContents.forEach((content) => {
    content.hidden = true;
    content.replaceChildren();
    content.closest('.stage').classList.remove('unlocked');
  });
  for (const button of [unlockTrace, unlockHint]) {
    button.hidden = false;
    button.disabled = true;
    button.setAttribute('aria-expanded', 'false');
  }
  mascot.classList.remove('golden');
  byId('celebration').hidden = true;
  byId('stages').hidden = mode !== 'mend';
  byId('glaze').hidden = true;
  byId('loading').hidden = false;
  byId('response-panel').hidden = true;
  byId('response-status').textContent = `Waiting for the ${body.language} ${mode} response…`;
  byId('greeting').textContent = 'Let’s take a closer look at this piece.';
  requestControls.forEach((control) => { control.disabled = true; });
  code.readOnly = true;

  try {
    const response = await fetch('/api/mend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await response.text();
    byId('raw-response').textContent = raw;
    byId('response-panel').hidden = !raw;
    byId('response-status').textContent = `HTTP ${response.status} · ${body.language} · ${mode}${raw ? '' : ' · Empty response'}`;
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      showError('The kiln returned an unreadable response. Please try again.');
      return;
    }
    if (!response.ok) {
      showError(typeof result?.error === 'string' ? result.error : 'The kiln couldn’t finish this piece. Please try again.');
      return;
    }
    const matchesMode = mode === 'mend'
      ? Array.isArray(result?.cracks) && result.cracks.every((crack) => Number.isInteger(crack?.line) && typeof crack.summary === 'string')
        && typeof result.is_bug_free === 'boolean' && typeof result.trace === 'string' && typeof result.golden_hint === 'string'
      : typeof result?.polished_code === 'string' && Array.isArray(result.polish_notes);
    if (!matchesMode || typeof result?.kintsu_greeting !== 'string') {
      showError('The kiln returned an incomplete result. Please try again.');
      return;
    }
    showResult(mode, result);
  } catch {
    byId('response-status').textContent = 'No response received from /api/mend.';
    showError('Kintsu couldn’t connect to the kiln. Check your connection and try again.');
  } finally {
    byId('loading').hidden = true;
    requestControls.forEach((control) => { control.disabled = false; });
    code.readOnly = false;
  }
}

byId('mend').addEventListener('click', () => submit('mend'));
byId('polish').addEventListener('click', () => submit('polish'));
byId('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(byId('polished-code').textContent);
    byId('copy').textContent = 'Copied';
    byId('copy-status').textContent = 'Polished code copied.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(byId('polished-code'));
    selection.removeAllRanges();
    selection.addRange(range);
    byId('copy').textContent = 'Copy manually';
    byId('copy-status').textContent = 'Code selected for manual copying.';
  }
});
updateEditor();
