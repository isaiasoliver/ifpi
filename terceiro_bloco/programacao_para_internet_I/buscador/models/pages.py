from config.postgres import Models


class Pages(Models):
    def insert(self, page: str, word: str, depth: str) -> dict:
        query = '''INSERT INTO public.pages (page, word, depth) VALUES ('{}', '{}', '{}')'''.format(
            page,
            word,
            depth)
        self.cur.execute(query)
        self.con.commit()

    
    def filter(self, page: str, word: str, depth: str) -> list:
        query = "SELECT * FROM public.pages WHERE page='{}' AND word='{}' AND depth='{}'".format(
            page,
            word,
            depth)
        self.cur.execute(query)
        return [{'page': p[0], 'word': p[1], 'depth': p[2]} for p in self.cur.fetchall()]
    

    def all(self) -> list:
        query = '''SELECT * FROM public.pages'''
        self.cur.execute(query)
        return self.cur.fetchall()


    def drop(self)-> bool:
        try:
            query = '''DROP TABLE public.pages'''
            self.cur.execute(query)
            self.con.commit()
            return True
        except:
            return False

    def table(self)-> bool:
        try:
            query = '''
                    CREATE TABLE IF NOT EXISTS public.pages (
                    id serial NOT NULL,
                    page text,
                    word text,
                    depth text,
                    created timestamp without time zone NOT NULL DEFAULT now()
                )
            '''
            self.cur.execute(query)
            self.con.commit()
            return True
        except:
            return False
