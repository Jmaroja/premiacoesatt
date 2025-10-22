import { chromium } from 'playwright';

 (async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = process.env.APP_URL || 'http://localhost:5173';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Click Nova Premiação button (text might be 'Nova Premiação')
  const newBtn = await page.locator('text=Nova Premiação').first();
  if (await newBtn.count() === 0) {
    console.error('Botão Nova Premiação não encontrado');
    await browser.close();
    process.exit(2);
  }
  await newBtn.click();

  // Wait for dialog
  await page.waitForSelector('role=dialog', { timeout: 5000 }).catch(() => {});

  // Focus the first Nome input inside dialog
  const nameInput = await page.locator('input[placeholder="Nome completo"]').first();
  if (await nameInput.count() === 0) {
    console.error('Input de Nome não encontrado');
    await browser.close();
    process.exit(3);
  }

  await nameInput.fill('ADON');

  // Wait for suggestion <ul> in body
  await page.waitForSelector('body > ul, body > div[role="listbox"], ul[role="listbox"], .suggestions, .react-autosuggest__suggestions-container', { timeout: 5000 }).catch(() => {});

  // Try to click first suggestion li
  const suggestion = await page.locator('body li').filter({ hasText: 'ADON' }).first();
  if (await suggestion.count() === 0) {
    // fallback: click first li in body
    const anyLi = await page.locator('body li').first();
    if (await anyLi.count() === 0) {
      console.error('Nenhuma sugestão encontrada');
      await browser.close();
      process.exit(4);
    } else {
      await anyLi.click();
    }
  } else {
    await suggestion.click();
  }

  // After selection, check if matricula text appears in the row
  // We expect a cell near the select containing the matricula; search for a known matricula from employees.json
  // We'll check that some 6+ digit alphanumeric appears in the dialog
  const dialogText = await page.locator('role=dialog').innerText();
  console.log('Dialog text after selection:', dialogText.slice(0, 300));

  // simple check: look for pattern of matricula (digits + E + digits), e.g., 000172E0003
  const matriculaMatch = dialogText.match(/[0-9]{3,}E[0-9]{4}/i);
  if (matriculaMatch) {
    console.log('Matrícula encontrada no modal:', matriculaMatch[0]);
    await browser.close();
    process.exit(0);
  } else {
    console.error('Matrícula não encontrada após seleção');
    await browser.close();
    process.exit(5);
  }
})();
