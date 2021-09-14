# Copyright 2021 Vauxoo (https://www.vauxoo.com) <info@vauxoo.com>
# License OPL-1 (https://www.odoo.com/documentation/user/13.0/legal/licenses/licenses.html).

from odoo import models, api
from odoo.exceptions import ValidationError


class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def public_check_vat(self, vat):
        """Create a dummy partner and checks the VAT."""
        partner = self.env["res.partner"]
        partner_dummy = partner.new({
            'vat': vat,
            'country_id': self.env.ref('base.mx').id
        })
        res = True
        try:
            partner_dummy.check_vat()
        except ValidationError:
            res = False
        return res

    @api.model
    def check_mode(self, order, partner_id, public_partner):
        """Return mode of the address."""
        partner_obj = self.with_context(show_address=1).sudo()

        shippings = partner_obj.search([
            ('id', 'child_of', order.partner_id.commercial_partner_id.ids),
            ('id', '=', partner_id)])

        if (partner_id not in shippings.ids and
                partner_id != order.partner_id.id and partner_id > 0):
            return ()

        # ('new', 'billing') assuming by default public user
        create = 'new'
        ship = 'billing'

        if partner_id == -1 or (partner_id != order.partner_id.id and
                                partner_id > 0):
            # ('new', 'shipping') creating a new contact
            ship = 'shipping'

        if order.partner_id.id != public_partner and partner_id > 0:
            # ('edit', 'billing') editing a registered main user/contact
            create = 'edit'

        mode = (create, ship)

        return mode

    @api.model
    def bind_partner(self, order, mode, partner_id):
        """Binding the order whi partner."""
        if not self.browse(partner_id).exists():
            return False

        extra = (lambda order, partner: None, lambda order, partner: None)
        action = {
            'billing': (
                lambda order, partner: setattr(order, 'partner_id', partner),
                lambda order, partner: order.onchange_partner_id()
            ),
            'shipping': (
                lambda order, partner: setattr(
                    order, 'partner_shipping_id', partner),
                lambda order, partner: None
            )
        }

        action.get(mode[1], extra)[0](order, partner_id)
        action.get(mode[1], extra)[1](order, partner_id)
        return True
