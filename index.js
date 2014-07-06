var dust = require('dust')();
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'auto-add'));

module.exports = function (sandbox, fn, options) {
    dust.render('auto-add', {}, function (err, out) {
        if (err) {
            return;
        }
        var elem = sandbox.append(out);
        var files = [];
        $('.make', elem).selecter({
            label: 'Make'
        });
        $('.model', elem).selecter({
            label: 'Model'
        });
        $('.year', elem).selecter({
            label: 'Year'
        });
        $('.fileupload', elem).fileupload({
            url: '/apis/v/vehicles',
            headers: {
                'x-host': 'auto.serandives.com:4000'
            },
            dataType: 'json',
            add: function (e, data) {
                files.push(data.files[0]);
                //data.submit();
            },
            submit: function (e, data) {
                console.log(data);
            },
            done: function (e, data) {
                console.log('Upload finished.');
            }
        });
        $('.add', elem).click(function (e) {
            $('.fileupload', elem).fileupload('send', {
                files: files,
                formData: {
                    data: JSON.stringify({
                        make: $('.make', elem).val(),
                        model: $('.model', elem).val(),
                        year: $('.year', elem).val(),
                        price: $('.price .min', elem).val(),
                        mileage: $('.mileage input', elem).val()
                    })
                }
            });
            return false;
        });
        fn(false, function () {
            sandbox.remove('.auto-add');
        });
    });
};