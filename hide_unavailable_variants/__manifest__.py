# -*- coding: utf-8 -*-
{
    'name': "Hide/Cancel-Out Unavailable Variants",

    'summary': """
        Hide/Cancel-Out the unavailable variants of the product in website shop""",

    'description': """When some of the variants for a product are not available, This app will give you  option to 
    "Cancel Out" or "Hide" those variants in your website shop. """,

    'author': 'ErpMstar Solutions',
    'category': 'Website',
    'version': '1.0',

    # any module necessary for this one to work correctly
    'depends': ['website_attr_display_type_button'],

    # always loaded
    'data': [
        'views/views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
    ],
    'installable': True,
    'application': True,
    'live_test_url': "https://www.youtube.com/watch?v=d2R744VE-8U&list=PL054IvUbtGqsygHVvfT4lXzOiJNHuUVy3",
    'images': ['static/description/banner.gif'],
    'website': '',
    'auto_install': False,
    'price': 25,
    'currency': 'EUR',
}
