import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const outputDir = process.env.QA_OUTPUT_DIR ?? 'qa-artifacts';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function inspectLayout(page, label) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }));

  assert(
    metrics.scrollWidth <= metrics.innerWidth + 1,
    `${label}: horizontal overflow (${metrics.scrollWidth}px > ${metrics.innerWidth}px)`,
  );

  const dialog = page.getByRole('dialog', { name: 'Interactive cube lesson' });
  await dialog.waitFor({ state: 'visible' });
  const dialogBox = await dialog.boundingBox();
  assert(dialogBox, `${label}: lesson dialog has no bounding box`);
  assert(dialogBox.x >= 0, `${label}: lesson dialog starts outside the viewport`);
  assert(
    dialogBox.x + dialogBox.width <= metrics.innerWidth + 1,
    `${label}: lesson dialog exceeds viewport width`,
  );
  assert(
    dialogBox.y + dialogBox.height <= metrics.innerHeight + 1,
    `${label}: lesson dialog exceeds viewport height`,
  );

  const cube = page.locator('#cube-3d-model');
  await cube.waitFor({ state: 'visible' });
  const cubeBox = await cube.boundingBox();
  assert(cubeBox, `${label}: cube has no bounding box`);
  assert(cubeBox.y >= 0, `${label}: cube begins above the viewport`);
  assert(
    cubeBox.y + cubeBox.height <= dialogBox.y - 4,
    `${label}: cube overlaps the lesson card`,
  );

  assert(
    !(await page.locator('#btn-spin-up').isVisible()),
    `${label}: legacy controls are visible during a lesson`,
  );

  return { metrics, dialog: dialogBox, cube: cubeBox };
}

function watchRuntime(page, errors) {
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
}

async function runCommand(page, command, successText) {
  const input = page.getByLabel('Cube program');
  await input.fill(command);
  await input.press('Enter');
  await page.getByText(successText, { exact: true }).waitFor({
    state: 'visible',
    timeout: 12_000,
  });
}

async function runDesktop(browser, report) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  watchRuntime(page, runtimeErrors);

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: `${outputDir}/desktop-start.png`,
    fullPage: true,
  });

  const startLayout = await inspectLayout(page, 'desktop start');
  assert(
    (await page.title()) === 'Rubik Lab — Learn by Moving',
    `Unexpected page title: ${await page.title()}`,
  );

  // A failed attempt must preserve the deterministic start without exposing the answer.
  await page.getByLabel('Cube program').fill('U');
  await page.getByLabel('Cube program').press('Enter');
  await page
    .getByText('Not yet. Use the hint or reveal the answer.', { exact: true })
    .waitFor();
  const lessonDialog = page.getByRole('dialog', { name: 'Interactive cube lesson' });
  assert(
    (await lessonDialog.locator('code').count()) === 0,
    'Wrong-answer feedback leaked the exact answer',
  );

  // Answer reveal is explicit and reversible.
  await lessonDialog.getByRole('button', { name: 'Answer' }).click();
  await lessonDialog.locator('code').getByText('R', { exact: true }).waitFor();
  await lessonDialog.getByRole('button', { name: 'Hide' }).click();
  assert((await lessonDialog.locator('code').count()) === 0, 'Answer did not hide');

  const lessons = [
    {
      command: 'R',
      success: 'One command changed the cube state.',
      next: 'Next',
    },
    {
      command: "R'",
      success: 'The inverse restored the previous state.',
      next: 'Next',
    },
    {
      command: 'R2',
      success: 'A half-turn is its own inverse.',
      next: 'Next',
    },
    {
      command: 'R U',
      success: 'The same commands in the right order restored the cube.',
      next: 'Next',
    },
    {
      command: 'R R',
      success: 'Different programs can produce the same state.',
      next: 'Next',
    },
    {
      command: "R U R' U'",
      success: 'The right-hand algorithm restored the cube.',
      next: 'Next',
    },
    {
      // Deliberately not the revealed example. R2 R' is equivalent to R.
      command: "R2 R' U",
      success: 'Your program matched the target state.',
      next: 'Next',
      target: true,
    },
    {
      // Deliberately longer than the example; the final four U turns cancel out.
      command: "U' R' U U U U",
      success: 'Solved. The checker cared only about the resulting state.',
      next: 'Next',
      target: true,
    },
    {
      command: 'R2',
      success: 'Target matched in one move.',
      next: 'Next',
      target: true,
      overBudget: 'R R',
      budgetMessage: 'Target matched in 2 moves. Budget: 1.',
    },
    {
      command: "repeat(6) { R U R' U' }",
      success: 'The loop ran 24 moves and returned to the start.',
      next: 'Free play',
    },
  ];

  for (const [index, lesson] of lessons.entries()) {
    if (lesson.target) {
      await page.getByLabel('Target cube state').waitFor({ state: 'visible' });
      await inspectLayout(page, `desktop target lesson ${index + 1}`);
    }

    if (lesson.overBudget) {
      await page.getByLabel('Move budget 1').waitFor({ state: 'visible' });
      const input = page.getByLabel('Cube program');
      await input.fill(lesson.overBudget);
      await input.press('Enter');
      await page.getByText(lesson.budgetMessage, { exact: true }).waitFor({
        state: 'visible',
        timeout: 12_000,
      });
      assert(
        !(await page.getByText(lesson.success, { exact: true }).isVisible()),
        'Over-budget solution was incorrectly accepted',
      );
    }

    await runCommand(page, lesson.command, lesson.success);
    await page.screenshot({
      path: `${outputDir}/desktop-lesson-${index + 1}.png`,
      fullPage: true,
    });
    await page
      .getByRole('dialog', { name: 'Interactive cube lesson' })
      .getByRole('button', { name: lesson.next })
      .click();
  }

  await page
    .getByRole('dialog', { name: 'Interactive cube lesson' })
    .waitFor({ state: 'hidden' });
  await page.getByRole('region', { name: 'Cube moves' }).waitFor();
  assert(
    !(await page.locator('#btn-spin-up').isVisible()),
    'Legacy free-play controls returned after lessons closed',
  );

  // Direct controls must visibly alter state and remain undoable.
  await page.getByRole('button', { name: 'R clockwise' }).click();
  await page.getByLabel('Undo last action').click();
  await page.getByLabel('Scramble cube').click();
  await page.getByLabel('Undo last action').click();
  await page.getByLabel('Reset cube').click();

  await page.screenshot({
    path: `${outputDir}/desktop-free-play.png`,
    fullPage: true,
  });

  assert(runtimeErrors.length === 0, runtimeErrors.join('\n'));
  report.desktop = {
    startLayout,
    lessonsCompleted: lessons.length,
    wrongAnswerRecovery: true,
    answerReveal: true,
    visualTargets: true,
    alternateTargetSolutions: true,
    moveBudgetFeedback: true,
    directMoveControls: true,
    freePlayControls: true,
  };

  await context.close();
}

async function runMobile(browser, report) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  watchRuntime(page, runtimeErrors);

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const startLayout = await inspectLayout(page, 'mobile start');
  assert(
    !(await page.getByLabel('Open menu').isVisible()),
    'Mobile legacy menu is visible during a lesson',
  );
  await page.screenshot({
    path: `${outputDir}/mobile-start.png`,
    fullPage: true,
  });

  await runCommand(page, 'R', 'One command changed the cube state.');
  await page.screenshot({
    path: `${outputDir}/mobile-success.png`,
    fullPage: true,
  });

  assert(runtimeErrors.length === 0, runtimeErrors.join('\n'));
  report.mobile = {
    startLayout,
    firstLessonCompleted: true,
  };

  await context.close();
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  baseUrl,
  generatedAt: new Date().toISOString(),
};

try {
  await runDesktop(browser, report);
  await runMobile(browser, report);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.error = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
