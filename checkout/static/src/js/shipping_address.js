odoo.define('checkout.shipping_address', function (require) {
    'use strict';

    var checkout = require('checkout.checkout'),
        ajax = require('web.ajax'),
        $shipping_check = $('#send_same_address'),
        $shipping_form = $("#shippingAddressForm"),
        $billing_form = $("#BillingAddressForm");

    if ($('.one_kanban .border_primary').length) {
        $shipping_check.parent('label').hide();
    }
    var validatorObj = $shipping_form.validate({
        submitHandler: function () { alert("Submitted!"); },
        rules: {
            phone: {
                digits: true
            },
        }
    });

    $shipping_check.on('click', function (ev) {
        var valid = $billing_form.valid();
        if (!valid) {
            ev.preventDefault();
            return;
        }
        
        var $to_toggle = $(".all_shippings");
        if ($(this).is(':checked')) {
            $to_toggle.slideUp();
            return;
        }
        $(ev.currentTarget).prop('disabled', 'disabled').addClass('disabled');
        $to_toggle.slideDown();
        $billing_form.slideUp();
        var csrf_token = $billing_form.find('input[name="csrf_token"]').val();
        ajax.post('/shop/render_billing',{csrf_token}
        ).then(function (data) {
            $('.js_billing_form').replaceWith(data);
            $(ev.currentTarget).prop('disabled', null).removeClass('disabled');
        });

    });
});
