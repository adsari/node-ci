const puppeteer = require('puppeteer');
const sessionFactoy = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class Page {
    static async build() {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
        const page = await browser.newPage();
        const customPage = new Page(page, browser);

        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || page[property] || browser[property];
            }
        })
    }

    constructor(page, browser) {
        this.page = page
        this.browser = browser;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactoy(user);
        await this.page.setCookie({ name: 'session', value: session })
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    close() {
        this.browser.close();
    }
}

module.exports = Page;