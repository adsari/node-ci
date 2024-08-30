const Page = require('./helpers/page')

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000/');
});

afterEach(async ()=> {
    await page.close();
});

test('Check Header Text', async () => {
    //const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});

test('Click Login', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toContain('accounts.google.com');
});

test('Post login, the logout is visible', async () => {
    await page.login();
    //const logoutText = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    const logoutText = await page.getContentsOf('a[href="/auth/logout"]');
    expect(logoutText).toEqual('Logout');
});