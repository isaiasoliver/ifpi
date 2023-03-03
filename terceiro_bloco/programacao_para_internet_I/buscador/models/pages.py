from config.postgres import Models


class Pages(Models):
    def insert(self, page: str, word: str, depth: str) -> int:
        query = '''
            INSERT INTO public.pages (page, word, depth) VALUES ('{}', '{}', '{}') RETURNING id;'''.format(
            page,
            word,
            depth)
        self.cur.execute(query)
        self.con.commit()
        return self.cur.fetchone()[0]

    
    def filter(self, page: str, word: str, depth: str) -> list:
        query = "SELECT * FROM public.pages WHERE page='{}' AND word='{}' AND depth='{}'".format(
            page,
            word,
            depth)
        self.cur.execute(query)
        return [{'page': p[1], 'word': p[2], 'depth': p[3], "phrase": p[4]} for p in self.cur.fetchall()]
    

    def all(self) -> list:
        query = '''SELECT * FROM public.pages'''
        self.cur.execute(query)
        return self.cur.fetchall()


    def update_by_id(self, id: int, phrase: str) -> bool:
        try:
            query = "UPDATE public.pages SET phrase='{}' WHERE id={}".format(
                phrase,
                id)
            self.cur.execute(query)
            self.con.commit()
            return True
        except:
            return False

    def drop(self) -> bool:
        try:
            query = '''DROP TABLE public.pages'''
            self.cur.execute(query)
            self.con.commit()
            return True
        except:
            return False

    def table(self) -> bool:
        try:
            query = '''
                    CREATE TABLE IF NOT EXISTS public.pages (
                    id serial NOT NULL,
                    page text,
                    word text,
                    depth text,
                    phrase text null,
                    created timestamp without time zone NOT NULL DEFAULT now()
                )
            '''
            self.cur.execute(query)
            self.con.commit()
            return True
        except:
            return False
