var dust = require('dust')();
var serand = require('serand');

var AUTO_API = '/apis/v/vehicles';

var cdn = serand.configs['cdn-images'];

var upload = function (data, files, next, elem) {
    $('.fileupload', elem).fileupload('send', {
        files: files,
        formData: {
            data: JSON.stringify(data)
        }
    }).success(function (data, status, xhr) {
        next();
    }).error(function (xhr, status, err) {
        next(err);
    }).complete(function (data, status, xhr) {
    });
};

var send = function (data, next, update) {
    $.ajax({
        url: AUTO_API + (update ? '/' + update : ''),
        type: update ? 'PUT' : 'POST',
        headers: {
            'x-host': 'autos.serandives.com'
        },
        contentType: 'multipart/form-data',
        dataType: 'json',
        data: {
            data: JSON.stringify(data)
        },
        success: function (data) {
            next();
        },
        error: function (xhr, status, err) {
            next(err);
        }
    });
};

dust.loadSource(dust.compile(require('./preview'), 'auto-add-preview'));
dust.loadSource(dust.compile(require('./template'), 'auto-add'));

var render = function (sandbox, fn, data) {
    var update = data.update;
    dust.render('auto-add', data, function (err, out) {
        if (err) {
            return;
        }
        var elem = sandbox.append(out);
        var pending = [];
        var existing = data.data.photos || [];
        var el = $('.make', elem);
        $('select', el).selecter({
            label: el.data('value') || 'Make'
        });
        el = $('.model', elem);
        $('select', el).selecter({
            label: el.data('value') || 'Model'
        });
        el = $('.year', elem);
        $('select', el).selecter({
            label: el.data('value') || 'Year'
        });
        $('.fileupload', elem).fileupload({
            url: AUTO_API + (update ? '/' + update : ''),
            type: update ? 'PUT' : 'POST',
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
            previewMaxWidth: 180,
            previewMaxHeight: 120,
            previewCrop: true
        }).on('fileuploadadd', function (e, data) {
            data.context = $('<div class="col-md-3 file"></div>');
            $.each(data.files, function (index, file) {
                var length = pending.push(file);
                dust.render('auto-add-preview', {
                    name: file.name,
                    index: length - 1
                }, function (err, out) {
                    if (err) {
                        return;
                    }
                    data.context.append(out);
                    $('.files').append(data.context);
                });
            });
        }).on('fileuploadprocessalways', function (e, data) {
            var index = data.index;
            var file = data.files[index];
            var node = $(data.context.children()[index]);
            if (file.preview) {
                $('.thumbnail', data.context).append(file.preview);
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
            var data = {
                make: $('.make select', elem).val(),
                model: $('.model select', elem).val(),
                year: $('.year select', elem).val(),
                price: $('.price input', elem).val(),
                mileage: $('.mileage input', elem).val(),
                color: $('.color input', elem).val(),
                description: $('.description textarea', elem).val()
            };
            if (update) {
                console.log(existing);
                data.photos = existing;
            }
            var next = function (err) {
                console.log('data updated/created successfully');
            };
            pending.length ? upload(data, pending, next, elem) : send(data, next, update);
            return false;
        });
        $(elem).on('click', '.remove-file', function () {
            var el = $(this);
            if (el.hasClass('pending')) {
                pending.splice(el.data('index'), 1);
            } else {
                existing.splice(existing.indexOf(el.data('id')), 1);
            }
            el.closest('.file').remove();
        });
        fn(false, function () {
            $('.auto-add', sandbox).remove();
        });
    });
};

module.exports = function (sandbox, fn, options) {
    var id = options.id;
    if (!id) {
        render(sandbox, fn, {
            data: {}
        });
        return;
    }
    $.ajax({
        url: AUTO_API + '/' + id,
        headers: {
            'x-host': 'autos.serandives.com'
        },
        dataType: 'json',
        success: function (data) {
            render(sandbox, fn, {
                update: id,
                cdn: cdn,
                data: data
            });
        },
        error: function () {
            render(sandbox, fn);
        }
    });
};