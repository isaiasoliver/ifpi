import psycopg2


class Models:
    def __init__(self):
        self.con = psycopg2.connect(
            host='127.0.0.1', 
            database='postgres',
            user='postgres', 
            password='postgres')
        self.cur = self.con.cursor()

