import { test, expect, type Locator, type Page } from '@playwright/test';

type TaskFilter = 'all' | 'open' | 'done';

function openTaskText(count: number): string {
  return `${count} open ${count === 1 ? 'task' : 'tasks'}`;
}

class TaskBenchPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  task(title: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async addTask(title: string): Promise<void> {
    await this.page.getByLabel('New task').fill(title);
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  async completeTask(title: string): Promise<void> {
    await this.task(title).getByRole('checkbox').check();
  }

  async chooseFilter(filter: TaskFilter): Promise<void> {
    switch (filter) {
      case 'all':
        await this.page.getByRole('button', { name: 'All' }).click();
        break;
      case 'open':
        await this.page.getByRole('button', { name: 'Open' }).click();
        break;
      case 'done':
        await this.page.getByRole('button', { name: 'Done', exact: true }).click();
        break;
      default:
        throw new Error(`Unknown task filter: ${filter}`);
    }
  }

  async expectOpenTasks(count: number): Promise<void> {
    await expect(this.page.getByText(openTaskText(count))).toBeVisible();
  }

  async clearDoneTasks(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clear done' }).click();
  }

  async changeCounter(actions: Array<'increase' | 'decrease'>): Promise<void> {
    for (const action of actions) {
      const name = action === 'increase' ? 'Increase counter' : 'Decrease counter';
      await this.page.getByRole('button', { name }).click();
    }
  }

  async expectCounter(value: number): Promise<void> {
    await expect(this.page.locator('#counter-value')).toHaveText(String(value));
  }
}

test.beforeEach(async ({ page }) => {
  const app = new TaskBenchPage(page);
  await app.goto();
});

test('adds and completes a task', async ({ page }) => {
  const app = new TaskBenchPage(page);

  await app.addTask('Practice selectors');

  await expect(app.task('Practice selectors')).toBeVisible();
  await app.expectOpenTasks(2);

  await app.completeTask('Practice selectors');
  await app.expectOpenTasks(1);
});

test('shows validation for empty tasks', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByRole('alert')).toHaveText('Please enter a task first.');
});

test('filters done tasks and clears them', async ({ page }) => {
  const app = new TaskBenchPage(page);

  await app.chooseFilter('done');
  await expect(app.task('Run a test')).toBeVisible();
  await expect(app.task('Try codegen')).toBeHidden();

  await app.clearDoneTasks();
  await expect(page.getByText('No tasks here yet.')).toBeVisible();
});

test('updates and resets the counter', async ({ page }) => {
  const app = new TaskBenchPage(page);

  await app.changeCounter(['increase', 'increase', 'decrease']);
  await app.expectCounter(1);

  await page.getByRole('button', { name: 'Reset' }).click();
  await app.expectCounter(0);
});

test('adds multiple tasks with a loop', async ({ page }) => {
  const app = new TaskBenchPage(page);
  const tasks = ['Learn loops', 'Practice classes', 'Use switch'];

  for (const task of tasks) {
    await app.addTask(task);
  }

  for (const task of tasks) {
    await expect(app.task(task)).toBeVisible();
  }

  await app.expectOpenTasks(4);
});
