var dust = require('dust')();
var serand = require('serand');
var autils = require('autos-utils');
var utils = require('utils');
var form = require('form');
var locate = require('locate');
var contacts = require('contacts');
var Vehicle = require('vehicles-service');
var Binaries = require('service-binaries');
var Make = require('vehicle-makes-service');
var Model = require('vehicle-models-service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-create'));

var AUTO_API = utils.resolve('autos:///apis/v/vehicles');

var resolution = '288x162';

var vehicleConfigs = {
    type: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the type of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.type', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value
            }, done);
        }
    },
    /*contacts: {
        find: function (context, source, done) {
            done(null, {
                email: 'user@serandives.com'
            });
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },*/
    manufacturedAt: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the year of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value ? moment(value).year() : ''
            }, done);
        }
    },
    doors: {
        find: function (context, source, done) {
            done(null, 5);
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    seats: {
        find: function (context, source, done) {
            done(null, 5);
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    engine: {
        find: function (context, source, done) {
            done(null, 1500);
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    driveType: {
        find: function (context, source, done) {
            done(null, 'front');
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    steering: {
        find: function (context, source, done) {
            done(null, 'right');
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    make: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the make of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.make', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    var thiz = $(this);
                    updateModels(vform.contexts.model, vform.elem, thiz.val(), null, function (err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            }, done);
        }
    },
    model: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the model of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.model', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value
            }, done);
        }
    },
    condition: {
        find: function (context, source, done) {
            done(null, $('input:checked', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the condition of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.condition', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value
            }, done);
        }
    },
    transmission: {
        find: function (context, source, done) {
            done(null, $('input:checked', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the transmission of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.transmission', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value
            }, done);
        }
    },
    fuel: {
        find: function (context, source, done) {
            done(null, $('input:checked', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the fuel of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.fuel', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value
            }, done);
        }
    },
    color: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
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
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
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
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
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
            done(null, 'LKR');
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    description: {
        find: function (context, source, done) {
            done(null, $('textarea', source).val());
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    images: {
        find: function (context, source, done) {
            serand.blocks('uploads', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please upload images of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.images', vform.elem);
            serand.blocks('uploads', 'create', el, {
                value: value
            }, done);
        }
    },
};

var contactsConfigs = {
    'contacts': {
        find: function (context, source, done) {
            context.pick = $('input:checked', source).val();
            if (context.pick === 'you') {
                return done();
            }
            context.contacts.find(done);
        },
        validate: function (context, data, value, done) {
            if (context.pick === 'you') {
                return done();
            }
            context.contacts.validate(value, done);
        },
        update: function (context, source, error, value, done) {
            if (context.pick === 'you') {
                return done(null, null, value);
            }
            context.contacts.update(error, value, done);
        },
        render: function (ctx, cform, data, value, done) {
            var el = $(cform.elem).find('> .contacts');
            var context = {};
            serand.blocks('radios', 'create', el, {
                value: value ? 'other' : 'you',
                change: function () {
                    cform.find(function (err, o) {
                        if (err) {
                            return done(err);
                        }
                        var source = $(cform.elem).find('> .sandbox');
                        context.pick = o.contacts ? 'other' : 'you';
                        if (context.pick === 'you') {
                            return source.addClass('hidden');
                        }
                        source.removeClass('hidden');
                    });
                }
            }, function (err) {
                if (err) {
                    return done(err);
                }
                contacts(ctx, {
                    id: cform.id,
                    sandbox: $(cform.elem).find('> .sandbox')
                }, {
                    required: true,
                    contacts: value
                }, function (err, o) {
                    if (err) {
                        return done(err);
                    }
                    context.contacts = o;
                    if (value) {
                        $(cform.elem).find('> .sandbox').removeClass('hidden');
                    }
                    done(null, context);
                });
            });
        }
    }
};

var create = function (id, data, done) {
    $.ajax({
        url: AUTO_API + (id ? '/' + id : ''),
        type: id ? 'PUT' : 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
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

var findModels = function (make, done) {
    if (!make) {
        return done(null, []);
    }
    Model.find(make, function (err, models) {
        if (err) {
            return done(err);
        }
        done(null, models);
    });
};

var updateModels = function (ctx, elem, make, model, done) {
    var source = $('.model', elem);
    findModels(make, function (err, models) {
        if (err) {
            return done(err);
        }
        var modelz = [{label: 'Model', value: ''}];
        modelz = modelz.concat(_.map(models, function (model) {
            return {label: model.title, value: model.id};
        }));
        serand.blocks('select', 'update', source, {
            options: modelz
        }, done);
    });
};

var runHandler = function (handler, done) {
    handler.find(function (err, o) {
        if (err) {
            return done(err);
        }
        handler.validate(o, function (err, errors, o) {
            if (err) {
                return done(err);
            }
            handler.update(errors, o, function (err) {
                if (err) {
                    return done(err);
                }
                if (errors) {
                    return done(null, errors);
                }
                done(null, null, o);
            });
        });
    });
};

var render = function (ctx, container, data, done) {
    var id = data.id;
    var update = !!id;
    var sandbox = container.sandbox;
    Make.find(function (err, makes) {
        if (err) {
            return done(err);
        }
        var makeData = [{label: 'Make', value: ''}];
        makeData = makeData.concat(_.map(makes, function (make) {
            return {
                value: make.id,
                label: make.title
            };
        }));
        findModels(data.make, function (err, models) {
            if (err) {
                return done(err);
            }

            var modelData = [{label: 'Models', value: ''}];
            modelData = modelData.concat(_.map(models, function (model) {
                return {
                    value: model.id,
                    label: model.title
                };
            }));

            var manufacturedAt = [{label: 'Year', value: ''}];
            var year = moment().year();
            var start = year - 100;
            while (year > start) {
                manufacturedAt.push({label: year, value: year});
                year--;
            }

            data._ = data._ || {};
            data._.makes = makeData;
            data._.models = modelData;
            data._.types = [
                {label: 'Type', value: ''},
                {label: 'SUV', value: 'suv'},
                {label: 'Car', value: 'car'},
                {label: 'Cab', value: 'cab'},
                {label: 'Bus', value: 'bus'},
                {label: 'Lorry', value: 'lorry'},
                {label: 'Backhoe', value: 'backhoe'},
                {label: 'Motorcycle', value: 'motorcycle'},
                {label: 'Threewheeler', value: 'threewheeler'},
            ];
            data._.manufacturedAt = manufacturedAt;
            data._.conditions = [
                {label: 'Brand New', value: 'brand-new'},
                {label: 'Used', value: 'used'},
                {label: 'Unregistered', value: 'unregistered'}
            ];
            data._.transmissions = [
                {label: 'Automatic', value: 'automatic'},
                {label: 'Manual', value: 'manual'},
                {label: 'Manumatic', value: 'manumatic'}
            ];
            data._.fuels = [
                {label: 'None', value: 'none'},
                {label: 'Petrol', value: 'petrol'},
                {label: 'Diesel', value: 'diesel'},
                {label: 'Hybrid', value: 'hybrid'},
                {label: 'Electric', value: 'electric'}
            ];
            data._.contacts = [
                {label: 'You', value: 'you'},
                {label: 'Other', value: 'other'}
            ];
            dust.render('vehicles-create', data, function (err, out) {
                if (err) {
                    return done(err);
                }
                var elem = sandbox.append(out);
                var handlers = {};
                var vehicleForm = form.create(container.id, $('.tab-pane[data-name="vehicle"] .step', elem), vehicleConfigs);
                handlers.vehicle = vehicleForm;
                vehicleForm.render(ctx, data, function (err) {
                    if (err) {
                        return done(err);
                    }
                    locate(ctx, {
                        id: container.id,
                        sandbox: $('.tab-pane[data-name="location"] .step', elem)
                    }, {
                        required: true,
                        location: data.location
                    }, function (err, o) {
                        if (err) {
                            return done(err);
                        }
                        handlers.location = o;
                        var contactsEl = $('.tab-pane[data-name="contacts"] .step', elem);
                        var contactForm = form.create(container.id, contactsEl, contactsConfigs);
                        contactForm.render(ctx, {
                            contacts: data.contacts
                        }, function (err) {
                            if (err) {
                                return done(err);
                            }
                            handlers.contacts = contactForm;
                            serand.blocks('steps', 'create', elem, {
                                step: function (from, done) {
                                    runHandler(handlers[from], done);
                                },
                                create: function (elem) {
                                    runHandler(handlers.vehicle, function (err, errors, vehicle) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        if (errors) {
                                            return;
                                        }
                                        runHandler(handlers.location, function (err, errors, loc) {
                                            if (err) {
                                                return console.error(err);
                                            }
                                            if (errors) {
                                                return;
                                            }
                                            vehicle.location = loc.location;
                                            runHandler(handlers.contacts, function (err, errors, con) {
                                                if (err) {
                                                    return console.error(err);
                                                }
                                                if (errors) {
                                                    return;
                                                }
                                                vehicle.contacts = con.contacts;
                                                create(id, vehicle, function (err) {
                                                    if (err) {
                                                        return console.error(err);
                                                    }
                                                });
                                            });
                                        });
                                    });
                                }
                            }, function (err) {
                                if (err) {
                                    return done(err);
                                }
                                $('.delete', elem).click(function (e) {
                                    e.stopPropagation();
                                    remove(id, function (err) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        console.log('data deleted successfully');
                                    });
                                    return false;
                                });
                                done(null, function () {
                                    $('.vehicles-create', sandbox).remove();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports = function (ctx, container, options, done) {
    options = options || {};
    var id = options.id;
    if (!id) {
        render(ctx, container, {
            _: {
                container: container.id
            }
        }, done);
        return;
    }
    Vehicle.findOne({
        id: id,
        resolution: resolution
    }, function (err, vehicle) {
        if (err) {
            return done(err);
        }
        vehicle._.container = container.id;
        render(ctx, container, vehicle, done);
    });
};
