from config.postgres import Models


class Pages(Models):
    def insert(self, url: str) -> dict:
        query = '''INSERT INTO public.pages (page) VALUES ('{}')'''.format(url)
        self.cur.execute(query)
        self.con.commit()


    def all(self) -> list:
        query = '''SELECT * FROM public.pages'''
        self.cur.execute(query)
        return cur.fetchall()
