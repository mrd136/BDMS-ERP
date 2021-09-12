# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    display_type = fields.Selection(selection_add=[
        ('radio',),
        ('select',),
        ('color',),
        ('button', 'Box')], default='radio', ondelete={'button': 'cascade'}, required=True, help="The display type "
                                                                                                   "used in the "
                                                                                                   "Product "
                                                                                                   "Configurator.")
