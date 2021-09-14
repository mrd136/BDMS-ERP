odoo.define('checkout.checkout', function (require) {
    'use strict';


    var core = require('web.core'),
        ajax = require('web.ajax'),
        wp = $('#website_partner').data('website-partner'),
        op = $('#order_partner').data('order-partner'),
        state = (op == wp) ? true : false,
        $conf_buttons = $("#checkout_payment_button"),
        $payment = $("#payment_method_buttons"),
        $ship_button = $("#send_same_address"),
        $shipping_form = $("#shippingAddressForm"),
        $shipping_inputs = $shipping_form.find('input[required]'),
        $all_shipping_inputs = $shipping_form.find('input'),
        $billing_form = $("#BillingAddressForm"),
        $card_form = $("#card-form"),
        _t = core._t;
    require('web.dom_ready');

    // Pay button disabled by default, enabled when state of the forms is valid.
    $conf_buttons.prop('disabled', state);
    $ship_button.prop('disabled', state);
    // Parsing JSON to make the library compatible with bootstrap 3
    $.validator.setDefaults({
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
    $.validator.addMethod("customemail",
        function (value, element) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        },
        _t("Type a valid email address")
    );
    //Bind validation library to forms
    bind_changes();
    bind_events();
    var $form = $("#BillingAddressForm"),
        $inputs = $form.find('input[required]'),
        $all_inputs = $form.find('input');
    var validatorObj = $form.validate({
        submitHandler: function () { alert("Submitted!"); },
        rules: {
            vat: {
                remote: {
                    url: "/validators/vat",
                    type: "post",
                    data: {
                        csrf_token: function () { return $('input[name=csrf_token]').val(); },
                        vat: function () { return 'MX' + $('input[name=vat]').val(); }
                    }
                },
            },
            phone: {
                digits: true
            },
            email: {
                required:  {
                    depends:function(){
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
                customemail: true
            }
        }
    });
    // When all required fields are filled save the partner
    $.each($all_inputs, function (index, value) {
        $(value).on('change', function () {
            var $inputs_filled = $form.find('input[required]:filled');
            if ($inputs.length == $inputs_filled.length && !validatorObj.numberOfInvalids()) {
                var form_fields = {
                    "name": $form.find('input[name="name"]').val(),
                    "email": $form.find('input[name="email"]').val(),
                    "phone": $form.find('input[name="phone"]').val(),
                    "company_name": $form.find('input[name="company_name"]').val(),
                    "vat": $form.find('input[name="vat"]').val(),
                    "zip": $form.find('input[name="zip"]').val(),
                    "street": $form.find('input[name="street"]').val(),
                    "state_id": $form.find('select[name="state_id"]').val(),
                    "country_id": $form.find('select[name="country_id"]').val(),
                    "city": $form.find('input[name="city"]').val(),
                    "csrf_token": $form.find('input[name="csrf_token"]').val(),
                    "submitted": $form.find('input[name="submitted"]').val(),
                    "partner_id": $form.find('input[name="partner_id"]').val(),
                    "callback": $form.find('input[name="callback"]').val()
                }
                $.ajax({
                    type: 'POST',
                    url: '/shop/check_address',
                    data: form_fields,
                    beforeSend: function ( xhr ) {
                        $("#delivery_carrier ul").hide();
                        $('<div class="text-center id="loading_spinner"><span class="fa fa-spinner fa-3x fa-spin"/></div>').insertAfter("#delivery_carrier ul");
                    }
                }).done(function (data) {
                    try {
                        var data_obj = $.parseJSON(data);
                        $form.find('input[name="partner_id"]').val(data_obj.partner_id);
                        $conf_buttons.prop('disabled', false);
                        $ship_button.prop('disabled', false);
                        $("#delivery_carrier ul").show();
                        $(".fa-spinner").parent().remove();
                    } catch (e) {
                        $conf_buttons.prop('disabled', false);
                        $ship_button.prop('disabled', false);
                        $("#delivery_carrier").replaceWith(data);
                        var cp_id = $("#delivery_carrier").find('#carrier_partner').data('carrier-partner');
                        $form.find('input[name="partner_id"]').val(cp_id);
                        bind_events();
                    }
                });
            }
        });
    });
    // When all required fields are filled save the contact
    $.each($all_shipping_inputs, function (index, value) {
        $(value).on('change', function () {
            var $inputs_filled = $shipping_form.find('input[required]:filled');
            if ($shipping_inputs.length == $inputs_filled.length && !validatorObj.numberOfInvalids()) {
                var form_fields = {
                    "name": $shipping_form.find('input[name="name"]').val(),
                    "phone": $shipping_form.find('input[name="phone"]').val(),
                    "zip": $shipping_form.find('input[name="zip"]').val(),
                    "street": $shipping_form.find('input[name="street"]').val(),
                    "state_id": $shipping_form.find('select[name="state_id"]').val(),
                    "country_id": $shipping_form.find('select[name="country_id"]').val(),
                    "city": $shipping_form.find('input[name="city"]').val(),
                    "csrf_token": $shipping_form.find('input[name="csrf_token"]').val(),
                    "submitted": $shipping_form.find('input[name="submitted"]').val(),
                    "partner_id": $shipping_form.find('input[name="partner_id"]').val(),
                    "callback": $shipping_form.find('input[name="callback"]').val(),
                    "parent_id": $billing_form.find('input[name="partner_id"]').val()
                }
                $.ajax({
                    type: 'POST',
                    url: '/shop/check_address',
                    data: form_fields,
                    beforeSend: function ( xhr ) {
                        $("#delivery_carrier ul").hide();
                        $('<div class="text-center id="loading_spinner"><span class="fa fa-spinner fa-3x fa-spin"/></div>').insertAfter("#delivery_carrier ul");
                    }
                }).done(function(data) {
                    try {
                        var data_obj = $.parseJSON(data);
                        $billing_form.find('input[name="partner_id"]').val(data_obj.partner_id);
                        $conf_buttons.prop('disabled', false);
                        $("#delivery_carrier ul").show();
                        $(".fa-spinner").parent().remove();
                    } catch (e) {
                        $conf_buttons.prop('disabled', false);
                        $("#delivery_carrier").replaceWith(data);
                        var cp_id = $("#delivery_carrier").find('#carrier_partner').data('carrier-partner');
                        $billing_form.find('input[name="partner_id"]').val(cp_id);
                        bind_events();
                    }
                });
            }
        });
    });
    $('.all_shippings').on('click', '.js_change_shipping', _.debounce(
        function () {
          if (!$('body.editor_enable').length) { // Allow to edit button text with editor
            var $old = $('.all_shippings').find('.panel.border_primary');
            $old.find('.btn-ship').toggle();
            $old.addClass('js_change_shipping');
            $old.removeClass('border_primary');

            var $new = $(this).parent('div.one_kanban').find('.panel');
            $new.find('.btn-ship').toggle();
            $new.removeClass('js_change_shipping');
            $new.addClass('border_primary');
            var $form = $(this).parent().find('form');
            $.post($form.attr('action'), $form.serialize()+'&xhr=1', function (data) {
                $.ajax({
                    type: 'POST',
                    url: '/shop/render_carriers',
                    data: {
                        partner_id: $form.find('input[name="partner_id"]').val(),
                        csrf_token: $form.find('input[name="csrf_token"]').val(),
                    },
                    beforeSend: function ( xhr ) {
                        $("#delivery_carrier ul").hide();
                        $('<div class="text-center id="loading_spinner"><span class="fa fa-spinner fa-3x fa-spin"/></div>').insertAfter("#delivery_carrier ul");
                    }
                }).done(function (data) {
                    location.reload();
                });
            });

          }
        }, 1000, true)
    );
    $(".address-column").on('click', '.edit_address', _.debounce(
        function (ev) {
            ev.preventDefault();
            var self = this;
            var partner_id = $billing_form.find('input[name="partner_id"]').val(),
                csrf_token = $billing_form.find('input[name="csrf_token"]').val();
            disableButtons($(ev.currentTarget));
            $.ajax({
                type: 'POST',
                url: '/shop/editme',
                data: {
                    partner_id: partner_id,
                    csrf_token: csrf_token
                }
            }).done(function (data) {
                var $kanban = $(self).parents('.one_kanban');
                $kanban.slideUp();
                $kanban.replaceWith(data);
                var $panel = $('.panel-edit-billing');
                $panel.find('form').validate();
                bind_changes();
            });
        }, 1000, true)
    );
    // Bind the contact edition
    function bind_kanban_events () {
        const edit_handler = function (ev) {
            const $form = $(this).parents('.one_kanban').find('form');
            const params = $form.serializeArray();
            disableButtons($(ev.currentTarget));
            ev.preventDefault();
            ev.stopPropagation();
            $.ajax({
                type: 'POST',
                url: '/shop/editme',
                data: params
            }).done((data) => {
                var $kanban = $(this).parents('.one_kanban');
                $kanban.slideUp();
                $kanban.replaceWith(data);
                var $panel = $('.panel-edit[data-partner-id="'+params.parent_id+'"]');
                $panel.find('form').validate();
            });
        }
        $('.address-column .js_edit_address').each(function () {
            this.addEventListener('click', _.debounce(edit_handler, 1000, true), false);
        });
    }

    // Finish editing the billing
    $('.address-column').on('click', '.js_finish_editing_billing', _.debounce(
        function (ev) {
            ev.preventDefault();
            var self = this;
            var $panel_billing = $(self).parents('.panel-edit-billing');
            var $temp_form = $panel_billing.find('form'),
                valid = $temp_form.valid(),
                csrf_token = $panel_billing.find('input[name="csrf_token"]').val(),
                partner_id = $panel_billing.find('input[name="partner_id"]').val();
            if (valid) {
                disableButtons($(ev.currentTarget));
                $.post('/shop/check_address', $temp_form.serialize()+'&xhr=1', function (data) {
                    render_kanban(csrf_token, partner_id);
                    render_billing_card(csrf_token);
                });
            }
        }, 1000, true)
    );
    // Finish editing the contact
    $('.address-column').on('click', '.js_finish_editing', _.debounce(
        function (ev) {
            ev.preventDefault();
            var self = this;
            var $temp_form = $(self).parents('.panel-edit').find('form'),
                valid = $temp_form.valid(),
                csrf_token = $(self).parents('.panel-edit').find('input[name="csrf_token"]').val(),
                partner_id = $(self).parents('.panel-edit').find('input[name="partner_id"]').val();
            if (valid) {
                disableButtons($(ev.currentTarget));
                var parent_id = $billing_form.find('input[name="partner_id"]').val()
                $.post('/shop/check_address', $temp_form.serialize()+'&parent_id='+parent_id+'&xhr=1', function (data) {
                    render_kanban(csrf_token, partner_id);
                });
            }
        }, 1000, true)
    );
    // Cancel adding contact
    $('.address-column').on('click', '.js_add_address_cancel', _.debounce(
        function (ev) {
            disableButtons($(ev.currentTarget));
            var $panel_add = $(this).parents('.panel-add'),
                csrf_token = $billing_form.find('input[name="csrf_token"]').val();
            render_kanban(csrf_token)
        }, 1000, true)
    );

    // Bind the contact addition
    $('.address-column').on('click', '.add-address', _.debounce(
        function (ev) {
            ev.preventDefault();
            disableButtons($(ev.currentTarget));
            var self = this;
            var csrf_token = $billing_form.find('input[name="csrf_token"]').val();
            $.ajax({
                type: 'POST',
                url: '/shop/addme',
                data: {
                    csrf_token: csrf_token
                }
            }).done(function (data) {
                var $kanban = $(self).parents('.one_kanban');
                $kanban.slideUp();
                $kanban.replaceWith(data);
                var $panel = $('.panel-add');
                $panel.find('form').validate();
            });
        }, 1000, true)
    );
    // Add a new address to an existing partner
    $('.address-column').on('click', '.js_add_address', _.debounce( 
        function (ev) {
            var self = this;
            var $add_form = $(self).parents('.panel-add').find('form'),
                valid = $add_form.valid(),
                csrf_token = $(self).parents('.panel-add').find('input[name="csrf_token"]').val(),
                partner_id = $(self).parents('.panel-add').find('input[name="partner_id"]').val();
            if (valid) {
                disableButtons($(ev.currentTarget));
                var parent_id = $billing_form.find('input[name="partner_id"]').val();
                $.post('/shop/check_address', $add_form.serialize()+'&parent_id='+parent_id+'&xhr=1', function (data) {
                    render_kanban(csrf_token, partner_id);
                });
            }
        }, 1000, true) 
    );
    // Set messages with the desired for particular cases
    $.extend($.validator.messages, {
        required: _t("This field is required"),
        remote: _t("Invalid VAT"),
        email: _t("Type a valid email address"),
        digits: _t("Type only numbers"),
    });

    var clickwatch = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    function bind_changes () {
        $('.address-column').on('change', "select[name='country_id']", function () {
            self = this;
            if ($(self).parents('form').find("select[name='country_id']").val()) {
            ajax.jsonRpc("/shop/country_infos/" + $(self).parents('form').find("select[name='country_id']").val(), 'call', {mode: 'shipping'}).then(
                function (data) {
                    // Populate states and display
                    var selectStates = $(self).parents('form').find("select[name='state_id']");
                    // Dont reload state at first loading (done in qweb)
                    if (selectStates.data('init')===0 || selectStates.find('option').length===1) {
                        if (data.states.length) {
                            selectStates.html('');
                            _.each(data.states, function (x) {
                                var opt = $('<option>').text(x[1])
                                    .attr('value', x[0])
                                    .attr('data-code', x[2]);
                                selectStates.append(opt);
                            });
                            selectStates.parent('div').show();
                        }
                        else {
                            selectStates.val('').parent('div').hide();
                        }
                        selectStates.data('init', 0);
                    }
                    else {
                        selectStates.data('init', 0);
                    }

                    // Manage fields order / visibility
                    if (data.fields) {
                        if ($.inArray('zip', data.fields) > $.inArray('city', data.fields)) {
                            $(".div_zip").before($(".div_city"));
                        }
                        else {
                            $(".div_zip").after($(".div_city"));
                        }
                        var all_fields = ["street", "zip", "city", "country_name"]; // "state_code"];
                        _.each(all_fields, function (field) {
                            $(".checkout_autoformat .div_" + field.split('_')[0]).toggle($.inArray(field, data.fields)>=0);
                        });
                    }
                }
            );
        }
        });
        $("select[name='country_id']").change();
    }
    // Intended to repeat code everytime that the delivery methods need to be
    // updated
    function update_shippings (partner_id, csrf_token) {
        $.ajax({
            type: 'POST',
            url: '/shop/render_carriers',
            data: {
                partner_id: partner_id,
                csrf_token: csrf_token,
            },
            beforeSend: function ( xhr ) {
                $("#delivery_carrier ul").hide();
                $('<div class="text-center id="loading_spinner"><span class="fa fa-spinner fa-3x fa-spin"/></div>').insertAfter("#delivery_carrier ul");
            }
        }).done(function(data) {
            $("#delivery_carrier").replaceWith(data);
            bind_events();
        });
    }
    // Used to render the kanban cards of the contact addresses
    // if the partner_id is passed the shippings will be recomputed
    function render_kanban (csrf_token, partner_id) {
        var partner_id = partner_id || false;
        $.ajax({
            type: 'POST',
            url: '/shop/render_kanban',
            data: {
                csrf_token: csrf_token
            }
        }).done(function (data) {
            $('.shipping_cards').replaceWith(data);
            if (partner_id) {
                update_shippings(parseInt(partner_id), csrf_token);
                bind_kanban_events();
            }
        });
    }
    function render_billing_card (csrf_token) {
        $.ajax({
            type: 'POST',
            url: '/shop/render_billing',
            data: {
                csrf_token: csrf_token,
            }
        }).done(function (data) {
            $('.panel-edit-billing').replaceWith(data);
        });
    }
    function bind_events () {
        var $carrier = $("#delivery_carrier");
        $carrier.find("input[name='delivery_type']").click(function (ev) {
            var carrier_id = $(ev.currentTarget).val();
            $.ajax({
                url: '/shop/set_carrier?carrier_id=' + carrier_id,
            }).done(function (data) {
                rerender_confirmation();
            });
        });
        // Writes the notes on the order
        $carrier.find(".js_instructions").on('change', function (ev) {
            var instructions = $(this).val();
            ajax.jsonRpc("/shop/delivery_instructions", 'call', {
                'instructions': instructions
            });
        });
    }
    // Async method used to update UI with consistent data on the confirmation
    // column.
    // :param recompute: if the method is called from the click event of the
    // delivery methods some extra calcuation must be done in order to re-render
    function rerender_confirmation (recompute) {
        recompute = (typeof recompute === 'undefined') ? false : recompute;
        var $confirm_order = $('#confirm_order');
        $.ajax({
            type: 'POST',
            url: '/shop/rerender_confirmation',
            data: {
                'recompute': recompute,
                'csrf_token': $('input[name="csrf_token"]').first().val()
            },
            beforeSend: function ( xhr ) {
                $("#confirm_order .order-total-qty").replaceWith('<div class="text-center"><span class="fa fa-spinner fa-2x fa-spin"/></div>');
            }
        }).done(function (data) {
            $confirm_order.replaceWith(data);
            delete_product_binder();
            change_qty_binder();
        });
    }
    // Delete button on lines of cart.
    function delete_product_binder () {
        var $product_row = $(".js_product_row");
        $product_row.on('click', '.js_delete_product', _.debounce(
            function (ev) {
                ev.preventDefault();
                var line_id = parseInt($(this).data('line-id'), 10),
                    product_id = parseInt($(this).data('product-id'), 10);
                ajax.jsonRpc("/shop/cart/update_json", 'call', {
                    'line_id': line_id,
                    'product_id': product_id,
                    'set_qty': 0
                }).then(function (data) {
                    validate_cart_quantity(data);
                });
            }, 1000, true)
        );
    }
    // Update quantity on sale order.
    function change_qty_binder (){
        var $product_row = $(".js_product_row");
        $product_row.on('change', '.js_quantity', function (ev) {
            ev.preventDefault();
            var line_id = parseInt($(this).data('line-id'), 10),
                product_id = parseInt($(this).data('product-id'), 10),
                qty = $(this).val();
            if (qty < 0.1) {
                qty = 0;
            }
            ajax.jsonRpc("/shop/cart/update_json", 'call', {
                'line_id': line_id,
                'product_id': product_id,
                'set_qty': qty
            }).then(function (data) {
                validate_cart_quantity(data);
            });
        });
    }

    function validate_cart_quantity (data) {
        if ( typeof data.cart_quantity === 'undefined' ) {
            // Reload the page because cart is empty, /shop/payment controller will redirect to /shop
            location.reload();
        } else {
            rerender_confirmation();
        }
    }
    /**
     * Disable buttons so that they can't be clicked anymore
     * @param {JQuery Object} [element] - The JQuery button that will be disabled
     */
    function disableButtons (element) {
        $(element)
            .prop('disabled', 'disabled')
            .addClass('disabled');
    }
    /**
     * Enable buttons so they can be clicked again
     * @param {JQuery Object} [element] - The JQuery button that will be enabled
     */
    function enableButtons (element) {
        $(element)
            .prop('disabled', null)
            .removeClass('disabled');
    }
    // Bind events on page render
    delete_product_binder();
    change_qty_binder();
    bind_kanban_events();
});
