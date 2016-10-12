var dust = require('dust')();
var serand = require('serand');
var autils = require('autos-utils');
var utils = require('utils');
var Make = require('vehicle-make-service');
var Model = require('vehicle-model-service');
var Vehicle = require('vehicle-service');

var cdn = autils.cdn();

var AUTO_API = utils.resolve('autos://apis/v/vehicles');

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

var send = function (data, done, update) {
    $.ajax({
        url: AUTO_API + (update ? '/' + data.id : ''),
        type: update ? 'PUT' : 'POST',
        contentType: 'multipart/form-data',
        dataType: 'json',
        data: {
            data: JSON.stringify(data)
        },
        success: function (data) {
            done();
        },
        error: function (xhr, status, err) {
            done(err);
        }
    });
};

var remove = function (id, done) {
    $.ajax({
        url: AUTO_API + '/' + id,
        type: 'DELETE',
        success: function (data) {
            done();
        },
        error: function (xhr, status, err) {
            done(err);
        }
    });
};

var select = function (el, val) {
    el = $('select', el);
    return val ? el.val(val) : el;
};

var updateModels = function (elem, make, model) {
    var html = '<option value="">Model</option>';
    var el = $('.model', elem);
    if (!make) {
        select(el).html(html).selecter('destroy').selecter();
        return;
    }
    Model.find(make, function (err, models) {
        if (err) {
            return;
        }
        var i;
        var m;
        for (i = 0; i < models.length; i++) {
            m = models[i];
            html += '<option value="' + m.id + '">' + m.title + '</option>';
        }
        select(el).html(html);
        select(el, model || '').selecter('destroy').selecter();
    });
};

dust.loadSource(dust.compile(require('./preview'), 'auto-add-preview'));
dust.loadSource(dust.compile(require('./template'), 'auto-add'));

var render = function (sandbox, fn, data) {
    var update = data._.update;
    var id = data.id;
    var existing = data.photos || [];
    Make.find(function (err, makes) {
        if (err) {
            return;
        }
        data._.makes = makes;
        dust.render('auto-add', autils.cdn288x162(data), function (err, out) {
            if (err) {
                return;
            }
            var elem = sandbox.append(out);
            var pending = [];
            var el = $('.make', elem);
            select(el, data.make || '').selecter({
                callback: function (make) {
                    updateModels(elem, make);
                }
            });
            updateModels(elem, data.make, data.model);
            el = $('.year', elem);
            select(el, data.year || '').selecter();
            $('.fileupload', elem).fileupload({
                url: AUTO_API + (update ? '/' + data.id : ''),
                type: update ? 'PUT' : 'POST',
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
                    make: select($('.make', elem)).val(),
                    model: select($('.model', elem)).val(),
                    year: select($('.year', elem)).val(),
                    condition: $('.condition input[name=condition]:checked', elem).val(),
                    transmission: $('.transmission input[name=transmission]:checked', elem).val(),
                    fuel: $('.fuel input[name=fuel]:checked', elem).val(),
                    color: $('.color input', elem).val(),
                    mileage: $('.mileage input', elem).val(),
                    price: $('.price input', elem).val(),
                    description: $('.description textarea', elem).val()
                };
                if (update) {
                    console.log(existing);
                    data.id = id;
                    data.photos = existing;
                }
                var done = function (err) {
                    console.log('data updated/created successfully');
                };
                pending.length ? upload(data, pending, done, elem) : send(data, done, update);
                return false;
            });
            $('.delete', elem).click(function (e) {
                e.stopPropagation();
                remove(id, function (err) {
                    console.log('data deleted successfully');
                });
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
    });
};

module.exports = function (sandbox, fn, options) {
    options = options || {};
    var id = options.id;
    if (!id) {
        render(sandbox, fn, {
            _: {}
        });
        return;
    }
    $.ajax({
        url: AUTO_API + '/' + id,
        dataType: 'json',
        success: function (data) {
            data._ = {
                update: true
            };
            render(sandbox, fn, data);
        },
        error: function () {
            render(sandbox, fn, {});
        }
    });
};
