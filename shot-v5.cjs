const { chromium } = require('/root/projects/opora/node_modules/.pnpm/playwright@1.65.1/node_modules/playwright');
const path = require('path');
const dir = '/root/.hermes/cache/scratch/opora-v5';
(async () => {
  const browser = await chromium.launch();
  for (const [w,h,tag] of [[1440,1000,'desktop'],[390,844,'mobile']]) {
    const page = await browser.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:1 });
    await page.goto('file://' + path.join(dir,'h-tihiy-siniy.html'), { waitUntil:'load' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir,`H-soft-${tag}.png`), fullPage:true });
    const d = await page.evaluate(()=>[document.body.scrollWidth, document.body.scrollHeight]);
    console.log(tag,'overX=',d[0]>w?'YES '+d[0]:'no','h=',d[1]);
    await page.close();
  }
  await browser.close();
})();
