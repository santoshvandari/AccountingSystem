├── apps
│   ├── accounts
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── migrations
│   │   │   └── __init__.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── __pycache__
│   │   │   ├── apps.cpython-312.pyc
│   │   │   └── __init__.cpython-312.pyc
│   │   ├── serializers
│   │   │   ├── __init__.py
│   │   │   ├── login.py
│   │   │   ├── password_change.py
│   │   │   ├── profile.py
│   │   │   └── user.py
│   │   ├── tests
│   │   │   ├── __init__.py
│   │   │   └── tests.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   └── views
│   │       ├── auth_views.py
│   │       ├── __init__.py
│   │       ├── profile_views.py
│   │       └── user_views.py
│   ├── billing
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── __init__.py
│   │   ├── migrations
│   │   │   └── __init__.py
│   │   ├── models
│   │   │   ├── bill_item.py
│   │   │   ├── bill.py
│   │   │   └── __init__.py
│   │   ├── serializers
│   │   │   ├── bill_serializer.py
│   │   │   └── __init__.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views
│   │       ├── bill_views.py
│   │       └── __init__.py
│   └── transactions
│       ├── admin.py
│       ├── apps.py
│       ├── __init__.py
│       ├── migrations
│       │   ├── 0001_initial.py
│       │   ├── 0002_alter_transaction_user.py
│       │   ├── __init__.py
│       │   └── __pycache__
│       │       ├── 0001_initial.cpython-312.pyc
│       │       ├── 0002_alter_transaction_user.cpython-312.pyc
│       │       └── __init__.cpython-312.pyc
│       ├── models
│       │   ├── __init__.py
│       │   └── transaction_model.py
│       ├── __pycache__
│       │   ├── admin.cpython-312.pyc
│       │   ├── apps.cpython-312.pyc
│       │   ├── __init__.cpython-312.pyc
│       │   ├── models.cpython-312.pyc
│       │   ├── serializer.cpython-312.pyc
│       │   ├── urls.cpython-312.pyc
│       │   └── views.cpython-312.pyc
│       ├── serializer
│       │   ├── __init__.py
│       │   └── transaction_serializer.py
│       ├── tests.py
│       ├── urls.py
│       └── views
│           ├── __init__.py
│           └── transactions.py
├── common
│   ├── __init__.py
│   ├── permissions.py
│   └── utils.py
├── config
│   ├── asgi.py
│   ├── __init__.py
│   ├── settings
│   │   ├── base.py
│   │   ├── dev.py
│   │   ├── __init__.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py
├── core
│   ├── __init__.py
│   ├── __pycache__
│   │   ├── __init__.cpython-312.pyc
│   │   ├── permissions.cpython-312.pyc
│   │   ├── settings.cpython-312.pyc
│   │   ├── urls.cpython-312.pyc
│   │   └── wsgi.cpython-312.pyc
│   └── settings.py
├── db.sqlite3
├── information.txt
├── manage.py
├── requirements.txt
