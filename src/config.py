import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or '3aef3dbe0736d57875c1b25840e30c46e9a460ced44aa6c6f1da2ced83d8e910'

    SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@db:5432/forum_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    RAWG_API_KEY = os.environ.get('RAWG_API_KEY')