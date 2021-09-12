# -*- coding: utf-8 -*-
import itertools
import json

from odoo import models, fields, api


class ProductTemplate(models.Model):
    _inherit = "product.template"

    def get_variant_count(self):
        for rec in self:
            valid_combination_list = []
            attribute_ids = []
            unavailable_variant_view_type = []

            vc = self.env['product.product'].search([('product_tmpl_id', '=', rec.id), ('active', '=', True)])
            for v in vc:
                val = []
                for value in v.product_template_attribute_value_ids:
                    val.append(value.id)
                    if value.attribute_id.id not in attribute_ids:
                        attribute_ids.append(value.attribute_id.id)
                        unavailable_variant_view_type.append(value.attribute_id.unavailable_value_view_type)

                valid_combination_list.append(tuple(val))
            valid_comb = set(valid_combination_list)
            value_count_per_attr = []
            attribute_line_ids = self.attribute_line_ids
            if attribute_line_ids:
                for line in attribute_line_ids:
                    value_count_per_attr.append(len(line.value_ids))

            j = 0
            available_variant_values_ids = {}
            all_val = []
            for item in list(valid_comb):
                all_val.extend(list(item))
                available_variant_values_ids[j] = (list(item))
                j += 1
            all_val = list(set(all_val))
            variant_val_child_dict = {}
            for i in range(len(all_val)):
                all_child_items = []
                for item in list(valid_comb):
                    items = list(item)
                    try:
                        offset = items.index(all_val[i])
                    except ValueError:
                        offset = -1
                    if offset == -1:
                        continue
                    child_item = []
                    for j in range(offset, len(items)):
                        child_item.append(items[j])
                    all_child_items.extend(child_item)
                child_list = list(set(all_child_items))
                variant_val_child_dict[all_val[i]] = child_list
            unavailable_variant_dict = {
                "attribute_ids": attribute_ids,
                "unavailable_variant_view_type": unavailable_variant_view_type,
                "value_to_show": variant_val_child_dict,
                "value_to_show_tuple": list(valid_comb),
                "value_count_per_attr": value_count_per_attr
            }

            return json.dumps(unavailable_variant_dict)


class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    unavailable_value_view_type = fields.Selection([('none', 'None'), ('cancel_out', 'Cancel Out'), ('hide', 'Hide')],
                                                   default='none', string='Unavailable Variant View Type')
