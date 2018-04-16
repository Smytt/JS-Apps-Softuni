$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);
        this.get('#/dashboard', getWelcomePage);

        this.post('#/register', (ctx) => {
            let username = ctx.params['username-register'];
            let password = ctx.params['password-register'];
            let repeatPass = ctx.params['password-register-check'];


            if (!/^.{5,}$/.test(username)) {
                notify.showError('Username should be at least 5 characters long');
            } else if (!/^.{1,}$/.test(password)) {
                notify.showError('Password shouldn\'t be ampty');
            } else if (repeatPass !== password) {
                notify.showError('Passwords must match!');
            } else {
                auth.register(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful.');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.post('#/login', (ctx) => {
            let username = ctx.params['username-login'];
            let password = ctx.params['password-login'];

            if (!/^.{5,}$/.test(username)) {
                notify.showError('Username should be at least 5 characters long');
            } else if (!/^.{1,}$/.test(password)) {
                notify.showError('Password shouldn\'t be ampty');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    notify.showInfo('Logout successful.');
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        });

        this.get('#/overview', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.user = sessionStorage.getItem('username');
            receipts.getAllReceipts(sessionStorage.getItem('userId'))
                .then((receipts) => {
                    ctx.receipts = receipts;
                    let grossTotal = 0;
                    receipts.forEach(receipt => {
                        grossTotal += parseFloat(receipt.total);
                    })
                    ctx.grossTotal = grossTotal;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        receipt: './templates/receipt.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                    }).then(function () {
                        this.partial('./templates/overview.hbs');
                    })
                })
        })

        this.get('#/receipt/:receiptId', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.user = sessionStorage.getItem('username');

            entries.getEntriesByReceiptId(ctx.params.receiptId)
                .then((entries) => {
                    entries.forEach(entry => {
                        entry.subtotal = (entry.qty * entry.price).toFixed(2);
                    })
                    ctx.entries = entries;

                    ctx.loadPartials({
                        entry: './templates/entryDetails.hbs',
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                    }).then(function () {
                        this.partial('./templates/receiptDetails.hbs');
                    })
                })
        })

        this.post('#/entry', (ctx) => {

            receipts.getActiveReceipt(sessionStorage.getItem('userId'))
                .then((receiptsByUser) => {
                    let type = ctx.params.type;
                    let qty = ctx.params.qty;
                    let price = ctx.params.price;
                    let receiptId = receiptsByUser[0]._id;


                    if (!/^.{1,}$/.test(type)) {
                        notify.showError('Product name shouldn\'t be empty.');
                    } else if (!/^(\d+\.)?\d+$/.test(qty)) {
                        notify.showError('Quantity should be a number');
                    } else if (!/^(\d+\.)?\d+$/.test(price)) {
                        notify.showError('Price should be a number');
                    } else {
                        entries.createNewEntry(type, qty, price, receiptId)
                            .then(() => {
                                notify.showInfo('Entry added');
                                ctx.redirect('#/dashboard')
                            })
                    }
                })
        });

        this.get('#/delete/entry/:entryId', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.user = sessionStorage.getItem('username');

            let entryId = ctx.params.entryId;

            entries.deleteEntry(entryId)
                .then(() => {
                    notify.showInfo('Entry deleted.');
                    ctx.redirect('#/dashboard');
                })
                .catch(notify.handleError);
        });

        this.get('#/checkout', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.user = sessionStorage.getItem('username');

            receipts.getActiveReceipt(sessionStorage.getItem('userId'))
                .then((receiptsByUser) => {
                    let receipt = receiptsByUser[0];
                    entries.getEntriesByReceiptId(receipt._id)
                        .then((entries) => {
                            if (entries.length === 0) {
                                notify.showInfo('Please add at least 1 entry.');
                                ctx.redirect("#/home")
                            }
                            else {
                                receipt.productCount = entries.length
                                let absoluteTotal = 0;

                                entries.forEach(entry => {
                                    absoluteTotal += (entry.price * entry.qty).toFixed(2)
                                })
                                receipt.total = absoluteTotal;
                                receipt.active = false;

                                receipts.checkOutReceipt(receipt)
                                    .then(() => {
                                        notify.showInfo('Receipt checked out.');
                                        ctx.redirect('#/home')
                                    })
                            }
                        })

                })
        });

        function getWelcomePage(ctx) {

            ctx.isAuth = auth.isAuth();


            if (!auth.isAuth()) {
                ctx.loadPartials({
                    footer: './templates/common/footer.hbs',
                    loginForm: './templates/forms/loginForm.hbs',
                    registerForm: './templates/forms/registerForm.hbs',
                }).then(function () {
                    this.partial('./templates/home-guest.hbs');
                })
            } else {
                receipts.getActiveReceipt(sessionStorage.getItem('userId'))
                    .then((receiptsByUser) => {
                        if (receiptsByUser.length === 0) {
                            receipts.createNewReceipt()
                                .then(function () {
                                    ctx.redirect('#/dashboard');
                                })
                                .catch(notify.handleError);
                        }
                        else {
                            let activeReceiptId;
                            receiptsByUser.forEach((r, i) => {
                                if (r.active == "true") {
                                    activeReceiptId = r._id;
                                }
                            })

                            entries.getEntriesByReceiptId(activeReceiptId)
                                .then((entries) => {
                                    let total = 0;
                                    entries.forEach(entry => {
                                        entry.subtotal = (entry.qty * entry.price).toFixed(2)
                                        total += parseFloat(entry.subtotal);
                                    })
                                    ctx.entries = entries;
                                    ctx.total = total;
                                    ctx.user = sessionStorage.getItem('username');

                                    ctx.loadPartials({
                                        createReceipt: './templates/forms/createReceipt.hbs',
                                        newEntry: './templates/forms/newEntry.hbs',
                                        entry: './templates/entry.hbs',
                                        header: './templates/common/header.hbs',
                                        navigation: './templates/common/navigation.hbs',
                                        footer: './templates/common/footer.hbs',
                                    }).then(function () {
                                        this.partial('./templates/home.hbs');
                                    })
                                })
                                .catch(notify.handleError);
                        }
                    })
            }

        }
    });

    app.run();
});