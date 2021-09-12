odoo.define('hide_unavailable_variants', function (require) {
    'use strict';
    var ajax = require('web.ajax');
    var publicWidget = require('web.public.widget');

    publicWidget.registry.WebsiteSale.include({

        start: function () {
            var self = this;
            var def = this._super.apply(this, arguments);
             setTimeout(function(){
            var checked_attr_val = $('.js_add_cart_variants').find("input:checked[type='radio']")
            var checked_val_list = []
            for (var i = 0; i < checked_attr_val.length; i++) {
                checked_val_list.push(parseInt($(checked_attr_val[i]).val()))
            }
            var id_tuples = $('.js_product').find("#unavailable_variant").data('values')
            if (id_tuples) {
                var value_to_show = id_tuples['value_to_show']
                var unavailable_variant_view_type = id_tuples['unavailable_variant_view_type']
                var z = $('.js_add_cart_variants').find("input[type='radio']")
                for (var i = 0; i < z.length; i++) {
                    if (value_to_show.hasOwnProperty($(z[i]).val()) === false) {
                        if (unavailable_variant_view_type[0] == 'none') {
                        }
                        else if (unavailable_variant_view_type[0] == 'cancel_out') {
                            $(z[i]).next().css({ "background": "linear-gradient(to right bottom, rgb(255, 255, 255) calc(50% - 1px), rgb(144, 128, 128), rgb(255, 255, 255) calc(50% + 1px))", "readonly": true });
                            $(z[i]).prop({ "disabled": true });
                        }
                        else if (unavailable_variant_view_type[0] == 'hide') {
                            $(z[i]).parent().css({ "display": "none" });
                        }
                    }
                }
                var attribute_ids = id_tuples['attribute_ids']
                var unavailable_variant_view_type = id_tuples['unavailable_variant_view_type']
                var all_attrs_childs = $('.js_product').find(".js_add_cart_variants").children()
                var value_to_show_tuple = id_tuples['value_to_show_tuple']
                var new_checked_list = []
                for (var vals2 = 0; vals2 < checked_val_list.length; vals2++) {
                    var clicked_on_variant_id = parseInt(checked_val_list[vals2])
                    new_checked_list.push(clicked_on_variant_id)

                    if (clicked_on_variant_id) {
                        var checked_attr_val_list = new_checked_list
                        var exact_show = []
                        for (var com_no = 0; com_no < value_to_show_tuple.length; com_no++) {
                            var result = checked_attr_val_list.every(val => value_to_show_tuple[com_no].includes(val));
                            if (result) {
                                if (exact_show.length > 0) {
                                    exact_show = exact_show.concat(value_to_show_tuple[com_no])
                                }
                                else {
                                    exact_show = value_to_show_tuple[com_no]
                                }
                            }
                        }
                        var unique_set = new Set(exact_show)
                        var list = Array.from(unique_set);

                        for (var i = 0; i < all_attrs_childs.length; i++) {
                            var variant_list = $(all_attrs_childs[i]).find('ul').children()
                            for (var j = 0; j < variant_list.length; j++) {
                                var variant_value = $(variant_list[j]).find('label').find('input')
                                var value_id = parseInt(variant_value.attr("data-value_id"))
                                if (value_id == clicked_on_variant_id) {
                                    var att_id = parseInt($(all_attrs_childs[i]).attr("data-attribute_id"))
                                    var iterate_from = attribute_ids.indexOf(att_id)
                                    var attr_index = iterate_from

                                    for (var z = iterate_from + 1; z < all_attrs_childs.length; z++) {
                                        var attr_var_list = $(all_attrs_childs[z]).find('ul').children()

                                        for (var x = 0; x < attr_var_list.length; x++) {
                                            var $input = $(attr_var_list[x]).find('label').find('input')
                                            var $label = $(attr_var_list[x]).find('label').find('label')

                                            var variant_value_id = $input.val()
                                            if (list.indexOf(parseInt(variant_value_id)) != -1) { }
                                            else {
                                                if (unavailable_variant_view_type[attr_index] == 'none') { }
                                                else if (unavailable_variant_view_type[attr_index] == 'cancel_out') {
                                                    $label.css({ "background": "linear-gradient(to right bottom, rgb(255, 255, 255) calc(50% - 1px), rgb(144, 128, 128), rgb(255, 255, 255) calc(50% + 1px))", "readonly": true });
                                                    $input.prop({ "disabled": true });
                                                }
                                                else if (unavailable_variant_view_type[attr_index] == 'hide') {

                                                    $(attr_var_list[x]).css({ "display": "none" });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            }, 1500)
            return def;
        },

        _getCombinationInfo: function (ev) {
            var self = this;

            if ($(ev.target).hasClass('variant_custom_value')) {
                return Promise.resolve();
            }

            var $parent = $(ev.target).closest('.js_product');
            var qty = $parent.find('input[name="add_qty"]').val();
            var combination = this.getSelectedVariantValues($parent);
            var parentCombination = $parent.find('ul[data-attribute_exclusions]').data('attribute_exclusions').parent_combination;
            var productTemplateId = parseInt($parent.find('.product_template_id').val());

            self._checkExclusions($parent, combination, ev);

            return ajax.jsonRpc(this._getUri('/sale/get_combination_info'), 'call', {
                'product_template_id': productTemplateId,
                'product_id': this._getProductId($parent),
                'combination': combination,
                'add_qty': parseInt(qty),
                'pricelist_id': this.pricelistId || false,
                'parent_combination': parentCombination,
            }).then(function (combinationData) {
                if (combinationData.internal_ref) {
                    $('#product_internal_ref').text(combinationData.internal_ref)
                }
                self._onChangeCombination(ev, $parent, combinationData);
            });
        },

        _checkExclusions: function ($parent, combination, ev) {
            var self = this;
            var combinationData = $parent
                .find('ul[data-attribute_exclusions]')
                .data('attribute_exclusions');

            $parent
                .find('option, input, label')
                .removeClass('css_not_available')
                .attr('title', '')
                .data('excluded-by', '');

            // exclusion rules: array of ptav
            // for each of them, contains array with the other ptav they exclude
            if (combinationData.exclusions) {
                // browse all the currently selected attributes
                _.each(combination, function (current_ptav) {
                    if (combinationData.exclusions.hasOwnProperty(current_ptav)) {
                        // for each exclusion of the current attribute:
                        _.each(combinationData.exclusions[current_ptav], function (excluded_ptav) {
                            // disable the excluded input (even when not already selected)
                            // to give a visual feedback before click
                            self._disableInput(
                                $parent,
                                excluded_ptav,
                                current_ptav,
                                combinationData.mapped_attribute_names
                            );
                        });
                    }
                });
            }

            // parent exclusions (tell which attributes are excluded from parent)
            _.each(combinationData.parent_exclusions, function (exclusions, excluded_by) {
                // check that the selected combination is in the parent exclusions
                _.each(exclusions, function (ptav) {

                    // disable the excluded input (even when not already selected)
                    // to give a visual feedback before click
                    self._disableInput(
                        $parent,
                        ptav,
                        excluded_by,
                        combinationData.mapped_attribute_names,
                        combinationData.parent_product_name
                    );
                });
            });

            //////////////////Extended Portion///////////////////////////

            var id_tuples = $parent.find("#unavailable_variant").data('values')
            var variants = JSON.parse(JSON.stringify(id_tuples))
            var value_to_show_tuple = variants.value_to_show_tuple
            var attribute_ids = variants.attribute_ids
            var value_count_per_attr = variants.value_count_per_attr
            var clicked_on_variant_id = parseInt($(ev.target).attr('data-value_id'))
            var unavailable_variant_view_type = variants.unavailable_variant_view_type
            var all_attrs_childs = $parent.find(".js_add_cart_variants").children()

            for (var i = 0; i < all_attrs_childs.length; i++) {
                var variant_list = $(all_attrs_childs[i]).find('ul').children()
                for (var j = 0; j < variant_list.length; j++) {
                    var variant_value = $(variant_list[j]).find('label').find('input')
                    var value_id = parseInt(variant_value.attr("data-value_id"))
                    if (value_id == clicked_on_variant_id) {
                        var att_id = parseInt($(all_attrs_childs[i]).attr("data-attribute_id"))
                        var iterate_from = attribute_ids.indexOf(att_id)
                        var attr_index = iterate_from

                        for (var z = iterate_from + 1; z < all_attrs_childs.length; z++) {
                            var attr_var_list = $(all_attrs_childs[z]).find('ul').children()

                            for (var x = 0; x < attr_var_list.length; x++) {
                                var $input = $(attr_var_list[x]).find('label').find('input')
                                var $label = $(attr_var_list[x]).find('label').find('label')
                                if (value_count_per_attr[z] > 1) {
                                    $(attr_var_list[x]).find('label').find('input').prop('checked', false)
                                }
                            }
                        }
                    }
                }
            }

            if (clicked_on_variant_id) {
                var checked_attr_val = $('.js_add_cart_variants').find("input:checked[type='radio']")
                var checked_attr_val_list = []
                for (var i = 0; i < checked_attr_val.length; i++) {
                    checked_attr_val_list.push(parseInt($(checked_attr_val[i]).val()))
                }
                var exact_show = []
                for (var com_no = 0; com_no < value_to_show_tuple.length; com_no++) {
                    var result = checked_attr_val_list.every(val => value_to_show_tuple[com_no].includes(val));

                    if (result) {
                        if (exact_show.length > 0) {
                            exact_show = exact_show.concat(value_to_show_tuple[com_no])
                        }
                        else {
                            exact_show = value_to_show_tuple[com_no]
                        }
                    }
                }
                var unique_set = new Set(exact_show)
                var list = Array.from(unique_set);
                var $first_attr_value = false

                for (var i = 0; i < all_attrs_childs.length; i++) {
                    var variant_list = $(all_attrs_childs[i]).find('ul').children()
                    for (var j = 0; j < variant_list.length; j++) {
                        var variant_value = $(variant_list[j]).find('label').find('input')
                        var value_id = parseInt(variant_value.attr("data-value_id"))
                        if (value_id == clicked_on_variant_id) {
                            var att_id = parseInt($(all_attrs_childs[i]).attr("data-attribute_id"))
                            var iterate_from = attribute_ids.indexOf(att_id)
                            var attr_index = iterate_from
                            var first_value = 0

                            for (var z = iterate_from + 1; z < all_attrs_childs.length; z++) {
                                var attr_var_list = $(all_attrs_childs[z]).find('ul').children()

                                for (var x = 0; x < attr_var_list.length; x++) {
                                    var $input = $(attr_var_list[x]).find('label').find('input')
                                    var $label = $(attr_var_list[x]).find('label').find('label')
                                    if (value_count_per_attr[z] > 1) {
                                        $(attr_var_list[x]).find('label').find('input').prop('checked', false)
                                    }
                                    var variant_value_id = $input.val()
                                    if (list.indexOf(parseInt(variant_value_id)) != -1) {
                                        if (first_value == 0) {
                                            $first_attr_value = $input
                                            first_value = 1
                                        }
                                        if (unavailable_variant_view_type[attr_index] == 'none') { }
                                        else if (unavailable_variant_view_type[attr_index] == 'cancel_out') {
                                            $label.css({ "background": "unset", "readonly": false });
                                            $input.prop({ "disabled": false });
                                        }
                                        else if (unavailable_variant_view_type[attr_index] == 'hide') {
                                            $(attr_var_list[x]).css({ "display": "unset" });
                                        }
                                    }
                                    else {
                                        if (unavailable_variant_view_type[attr_index] == 'none') { }
                                        else if (unavailable_variant_view_type[attr_index] == 'cancel_out') {
                                            $label.css({ "background": "linear-gradient(to right bottom, rgb(255, 255, 255) calc(50% - 1px), rgb(144, 128, 128), rgb(255, 255, 255) calc(50% + 1px))", "readonly": true });
                                            $input.prop({ "disabled": true });
                                        }
                                        else if (unavailable_variant_view_type[attr_index] == 'hide') {
                                            $(attr_var_list[x]).css({ "display": "none" });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if ($first_attr_value) {
                    $first_attr_value.prop('checked', true)
                    $first_attr_value.change()
                }
            }
            $parent.find("p.css_not_available_msg").remove()
            /////////////////////////////////////////////
        },
    });
});