var dust = require('dust')();
var serand = require('serand');
var autils = require('autos-utils');
var utils = require('utils');
var form = require('form');
var locate = require('locate');
var Vehicle = require('vehicles-service');
var Make = require('vehicle-makes-service');
var Model = require('vehicle-models-service');

dust.loadSource(dust.compile(require('./preview'), 'vehicles-create-preview'));
dust.loadSource(dust.compile(require('./template'), 'vehicles-create'));

var AUTO_API = utils.resolve('autos:///apis/v/vehicles');

var configs = {
    type: {
        find: function (context, source, done) {
            var value = form.select(source).val();
            if (!value) {
                return done(null, 'Please select the type of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (elem, data, value, done) {
            var el = $('.type', elem);
            form.selectize(form.select(el, null, value || ''));
            done();
        }
    },
    contacts: {
        find: function (context, source, done) {
            done(null, null, {
                email: 'user@serandives.com'
            });
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    manufacturedAt: {
        find: function (context, source, done) {
            var value = form.select(source).val();
            if (!value) {
                return done(null, 'Please select the year of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (elem, data, value, done) {
            var el = $('.manufacturedAt', elem);
            value = value ? moment(value).year() : '';
            form.selectize(form.select(el, null, value));
            done();
        }
    },
    location: {
        find: function (context, source, done) {
            context.eventer.emit('find', done);
        },
        update: function (context, source, error, value, done) {
            context.eventer.emit('update', done);
        },
        render: function (elem, data, value, done) {
            var options = _.isString(value) ? {location: value} : value;
            locate($('.location', elem), options, function (err, eventer) {
                if (err) {
                    return done(err);
                }
                eventer.on('change', function (location, done) {
                    var button = $('.next', elem);
                    if (location === '+') {
                        step(elem, button, 'location', 'Next');
                        return done();
                    }
                    step(elem, button, 'vehicle', 'Add');
                    done();
                });
                done(null, {eventer: eventer});
            });
        },
        create: function (context, value, done) {
            context.eventer.emit('create', value, done);
        }
    },
    doors: {
        find: function (context, source, done) {
            done(null, null, 5);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    seats: {
        find: function (context, source, done) {
            done(null, null, 5);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    engine: {
        find: function (context, source, done) {
            done(null, null, 1500);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    driveType: {
        find: function (context, source, done) {
            done(null, null, 'front');
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    steering: {
        find: function (context, source, done) {
            done(null, null, 'right');
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    make: {
        find: function (context, source, done) {
            var value = form.select(source).val();
            if (!value) {
                return done(null, 'Please select the make of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (elem, data, value, done) {
            var el = $('.make', elem);
            value = value ? value.id : '';
            form.selectize(form.select(el, null, value)).on('change', function (make) {
                updateModels(elem, {id: make}, null, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            });
            done();
        }
    },
    model: {
        find: function (context, source, done) {
            var value = form.select(source).val();
            if (!value) {
                return done(null, 'Please select the model of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (elem, data, value, done) {
            updateModels(elem, data.make, data.model, done);
        }
    },
    condition: {
        find: function (context, source, done) {
            var value = $('input:checked', source).val();
            if (!value) {
                return done(null, 'Please select the condition of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    transmission: {
        find: function (context, source, done) {
            var value = $('input:checked', source).val();
            if (!value) {
                return done(null, 'Please select the transmission of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    fuel: {
        find: function (context, source, done) {
            var value = $('input:checked', source).val();
            if (!value) {
                return done(null, 'Please select the fuel of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    color: {
        find: function (context, source, done) {
            var value = $('input', source).val();
            if (!value) {
                return done(null, 'Please enter the color of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    mileage: {
        find: function (context, source, done) {
            var value = $('input', source).val();
            if (!value) {
                return done(null, 'Please enter the mileage of your vehicle');
            }
            value = Number(value);
            if (!is.number(value)) {
                return done(null, 'Please enter a valid number for the mileage of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    price: {
        find: function (context, source, done) {
            var value = $('input', source).val();
            if (!value) {
                return done(null, 'Please enter the price of your vehicle');
            }
            value = Number(value);
            if (!is.number(value)) {
                return done(null, 'Please enter a valid amount for the price of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    currency: {
        find: function (context, source, done) {
            done(null, null, 'LKR');
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    description: {
        find: function (context, source, done) {
            var value = $('textarea', source).val();
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    }
};

var upload = function (data, files, elem, done) {
    var xhr = $('.fileupload', elem).fileupload('send', {
        paramName: 'photos',
        files: files,
        formData: {
            data: JSON.stringify(data)
        }
    })
    xhr.done(function (data, status, xhr) {
        done();
    }).fail(function (xhr, status, err) {
        done(err);
    }).always(function (data, status, xhr) {
    });
};

var send = function (data, update, done) {
    $.ajax({
        url: AUTO_API + (update ? '/' + data.id : ''),
        type: update ? 'PUT' : 'POST',
        contentType: 'multipart/form-data',
        dataType: 'json',
        data: {
            data: JSON.stringify(data)
        },
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

var remove = function (id, done) {
    $.ajax({
        url: AUTO_API + '/' + id,
        type: 'DELETE',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

var step = function (elem, button, name, next) {
    button.find('.content').text(next);
    button.data('step', name);
    if (name === 'location') {
        $('.step-vehicle', elem).addClass('hidden');
        return;
    }
    if (name === 'vehicle') {
        $('.step-' + name, elem).removeClass('hidden');
    }
};

var add = function (id, update, vform, existing, pending, elem) {
    $('.help-block', elem).addClass('hidden');
    var add = $(this).attr('disabled', true);
    var spinner = $('.spinner', add).removeClass('hidden');
    vform.find(function (err, errors, data) {
        if (err) {
            return console.error(err);
        }
        console.log('find');
        console.log(data);
        if (errors) {
            vform.update(errors, data, function (err) {
                if (err) {
                    return console.error(err);
                }
                add.removeAttr('disabled');
            });
            return;
        }
        if (update) {
            console.log(existing);
            data.id = id;
            data.photos = existing;
        }
        vform.create(data, function (err, data) {
            console.log('create')
            console.log(data)
            var done = function (err) {
                spinner.addClass('hidden');
                if (err) {
                    console.error('error while updating/creating the vehicle');
                    return add.removeAttr('disabled');
                }
                console.log('data updated/created successfully');
                add.find('.content').text('Added');
            };
            pending.length ? upload(data, pending, elem, done) : send(data, update, done);
        });
    });
};

var modelSelect;

var updateModels = function (elem, make, model, done) {
    var html = '<option value="">Model</option>';
    var el = $('.model', elem);
    if (modelSelect) {
        modelSelect.destroy();
    }
    if (!make) {
        modelSelect = form.selectize(form.select(el).html(html));
        return done();
    }
    Model.find(make.id, function (err, models) {
        if (err) {
            return done(err);
        }
        var i;
        var m;
        for (i = 0; i < models.length; i++) {
            m = models[i];
            html += '<option value="' + m.id + '">' + m.title + '</option>';
        }
        modelSelect = form.selectize(form.select(el, html, model ? model.id : null));
        done();
    });
};

var render = function (sandbox, data, done) {
    var update = data._.update;
    var id = data.id;
    var existing = data.photos || [];
    Make.find(function (err, makes) {
        if (err) {
            return done(err);
        }
        data._.makes = makes;
        dust.render('vehicles-create', data, function (err, out) {
            if (err) {
                return done(err);
            }
            var elem = sandbox.append(out);
            var vform = form.create(elem, configs);
            vform.render(data, function (err) {
                if (err) {
                    return done(err);
                }
                var el;
                var pending = [];
                // el = $('.year', elem);
                // form.selectize(select(el, data.year || ''));
                $('.fileupload', elem).fileupload({
                    url: AUTO_API + (update ? '/' + data.id : ''),
                    type: update ? 'PUT' : 'POST',
                    dataType: 'json',
                    autoUpload: false,
                    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                    maxFileSize: 5000000, // 5 MB
                    disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
                    previewMaxWidth: 180,
                    previewMaxHeight: 120,
                    previewCrop: true
                }).on('fileuploadadd', function (e, data) {
                    data.context = $('<div class="col-md-3 file"></div>');
                    $.each(data.files, function (index, file) {
                        var length = pending.push(file);
                        dust.render('vehicles-create-preview', {
                            name: file.name,
                            index: length - 1
                        }, function (err, out) {
                            if (err) {
                                return console.error(err);
                            }
                            data.context.append(out);
                            $('.files', elem).append(data.context);
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
                        node.append('<br>').append($('<span class="text-danger"/>').text(file.error));
                    }
                }).on('fileuploadprogressall', function (e, data) {

                }).on('fileuploaddone', function (e, data) {

                }).on('fileuploadfail', function (e, data) {

                }).prop('disabled', !$.support.fileInput)
                    .parent().addClass($.support.fileInput ? undefined : 'disabled');
                $('.next', elem).click(function (e) {
                    e.stopPropagation();
                    var context;
                    var thiz = $(this);
                    var name = thiz.data('step');
                    if (name === 'location') {
                        context = vform.context('location');
                        context.eventer.emit('find', function (err, errors, data) {
                            if (err) {
                                return console.error(err);
                            }
                            context.eventer.emit('update', errors, data, function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                if (errors) {
                                    return;
                                }
                                context.eventer.emit('collapse', function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    step(elem, thiz, 'vehicle', 'Add');
                                });
                            });
                        });
                        return false;
                    }
                    if (name === 'vehicle') {
                        add(id, update, vform, existing, pending, elem);
                        return false;
                    }
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
                    return false;
                });
                done(null, function () {
                    $('.vehicles-create', sandbox).remove();
                });
            });
        });
    });
};

module.exports = function (sandbox, options, done) {
    options = options || {};
    var id = options.id;
    if (!id) {
        render(sandbox, {
            _: {}
        }, done);
        return;
    }
    Vehicle.findOne({
        id: id,
        images: '288x162'
    }, function (err, vehicle) {
        if (err) {
            return done(err);
        }
        vehicle._.update = true;
        render(sandbox, vehicle, done);
    });
};
