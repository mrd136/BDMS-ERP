odoo.define('checkout.payment', function (require) {
    "use strict";

    var ajax = require('web.ajax'),
        core = require('web.core'),
        Widget = require("web.Widget");
    require('web.dom_ready');
    const $payment_button = $('#payment_method_buttons');

    var paymentButton = Widget.extend({
        events: {
            'click #checkout_payment_button': 'onClick',
        },
        init () {
            this._super.apply(this, arguments);
            this.onClick = _.debounce(this.onClick, 1000, true);
        },
        start: function () {
            this._super(...arguments)
            $('#o_payment_form_pay').hide(); 
        },
        onClick: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#o_payment_form_pay').trigger('click');
        },
    });

    // Validate if element exists to bind it
    if (!$payment_button.length) {
        return $.Deferred().reject("Dom Does not contain the pay button #payment_method_buttons");     
    }
    // Bind object to element
    $payment_button.each(function () {
        var $elem = $(this);
        var button = new paymentButton(null, $elem.data());
        button.attachTo($elem);
    });
    return paymentButton;
});
