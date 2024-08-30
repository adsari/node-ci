const Page = require('./helpers/page')

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000/');
});

afterEach(async () => {
    await page.close();
});

describe('When Logged In', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Navigate to new Blogs Page', async () => {
        const label = await page.getContentsOf('form label');
        console.log(label)
        expect(label).toEqual('Blog Title');
    });

    describe('Using Valid Inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'This is an automated Title');
            await page.type('.content input', 'This is an automated Content');
            await page.click('form button');
        });
        test('Submitting takes user to next page', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });
        test('Submitting then saving takes user to index', async () => {
            await page.click('button.green');
            await page.waitFor('.card')
            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p');

            expect(title).toEqual('This is an automated Title');
            expect(content).toEqual('This is an automated Content')
        });
    });

    describe('And using Invalid Input', async () => {
        beforeEach(async () => {
            await page.click('form button');

        });
        test('Form Shows Error', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    })
});

describe('When not logged in', async () => {
    test('User cannot create blog post', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'title': 'My API Title',
                        'content': 'My API Conent'
                    })
                }).then(res => res.json());
            }
        );
        expect(result).toEqual({ error: 'You must log in!' })
    });

    test('User cannot fetch blog post', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
            }
        );
        expect(result).toEqual({ error: 'You must log in!' })
    });
    
})