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
                'x-host': 'autos.serandives.com'
            },
            dataType: 'json',
            autoUpload: false,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            maxFileSize: 5000000, // 5 MB
            // Enable image resizing, except for Android and Opera,
            // which actually support image resizing, but fail to
            // send Blob objects via XHR requests:
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
            previewMaxWidth: 100,
            previewMaxHeight: 100,
            previewCrop: true
        }).on('fileuploadadd', function (e, data) {
            console.log('fileuploadadd');
            data.context = $('<div class="col-md-3 file"></div>');
            $.each(data.files, function (index, file) {
                var length = files.push(file);
                data.context.append(
                    '<div class="info row">' +
                    '<div class="col-md-6 col-xs-6 filename">' + file.name + '</div>' +
                    '<div class="col-md-6 col-xs-6">' +
                    '<button type="button" class="btn btn-default btn-xs pull-right remove-file" data-index="' + (length - 1) + '">' +
                    '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
                    '</button>' +
                    '</div>' +
                    '</div>'
                );
                $('.files').append(data.context);
            });
        }).on('fileuploadprocessalways', function (e, data) {
            console.log('processalways');
            var index = data.index;
            var file = data.files[index];
            var node = $(data.context.children()[index]);
            if (file.preview) {
                data.context.append($('<div class="thumbnail"/>').append(file.preview));
            }
            if (file.error) {
                node
                    .append('<br>')
                    .append($('<span class="text-danger"/>').text(file.error));
            }
            /*if (index + 1 === data.files.length) {
             data.context.find('button')
             .text('Upload')
             .prop('disabled', !!data.files.error);
             }*/
        }).on('fileuploadprogressall', function (e, data) {
            /*var progress = parseInt(data.loaded / data.total * 100, 10);
             $('#progress .progress-bar').css(
             'width',
             progress + '%'
             );*/
        }).on('fileuploaddone', function (e, data) {
            /*$.each(data.result.files, function (index, file) {
             if (file.url) {
             var link = $('<a>')
             .attr('target', '_blank')
             .prop('href', file.url);
             $(data.context.children()[index])
             .wrap(link);
             } else if (file.error) {
             var error = $('<span class="text-danger"/>').text(file.error);
             $(data.context.children()[index])
             .append('<br>')
             .append(error);
             }
             });*/
        }).on('fileuploadfail', function (e, data) {
            /*$.each(data.files, function (index) {
             var error = $('<span class="text-danger"/>').text('File upload failed.');
             $(data.context.children()[index])
             .append('<br>')
             .append(error);
             });*/
        }).prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');

        $('.add', elem).click(function (e) {
            e.stopPropagation();
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

        $(elem).on('click', '.remove-file', function () {
            var el = $(this);
            var index = el.data('index');
            files.splice(index, 1);
            el.closest('.file').remove();
        });

        fn(false, function () {
            $('.auto-add', sandbox).remove();
        });
    });
};