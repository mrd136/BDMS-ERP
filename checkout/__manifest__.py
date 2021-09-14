# Copyright 2021 Vauxoo (https://www.vauxoo.com) <info@vauxoo.com>
# License OPL-1 (https://www.odoo.com/documentation/user/13.0/legal/licenses/licenses.html).

{
    'name': 'One Page Checkout',
    'summary': 'One Page Checkout',
    'author': 'Vauxoo',
    'website': 'http://www.vauxoo.com',
    'license': 'OPL-1',
    'category': 'website',
    'version': '14.0.1.0.0',
    'depends': [
        'website_sale_delivery',
        'base_vat',
    ],
    'test': [
    ],
    'data': [
        'data/image_assets.xml',
        'views/assets.xml',
        'views/checkout.xml',
    ],
    'demo': [
        'demo/res_user_demo.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'live_test_url': 'https://www.vauxoo.com/r/checkout_140',
    'price': 99,
    'currency': 'EUR',
    'images': [
        'static/description/main_screen.jpeg'
    ],
}
