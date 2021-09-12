# -*- coding: utf-8 -*-
{
    'name': "Website Product Attribute Display Type: Box",

    'summary': """Change the view of product attribute values""",

    'description': """By using this application you can change the view of product attribute or variant values as box 
    or button. This will increase the better experience of your website shop customers.""",

    'author': 'ErpMstar Solutions',
    'category': 'Website',
    'version': '1.0',

    # any module necessary for this one to work correctly
    'depends': ['website_sale'],

    # always loaded
    'data': [
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
    ],
    'installable': True,
    'application': True,
    'live_test_url': "https://www.youtube.com/watch?v=JoYlUI59KCU&list=PL054IvUbtGqsygHVvfT4lXzOiJNHuUVy3",
    'images': ['static/description/box_view.png'],
    'website': '',
    'auto_install': False,
    'price': 50,
    'currency': 'EUR',
}
