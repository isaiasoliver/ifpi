import requests
from bs4 import BeautifulSoup
import psycopg2

con = psycopg2.connect(host='127.0.0.1', 
                        database='postgres',
                        user='postgres', 
                        password='postgres')


# Create table pages
query_create_table = '''
    CREATE TABLE IF NOT EXISTS public.pages (
        id serial NOT NULL,
        page text,
        created timestamp without time zone NOT NULL DEFAULT now()
    );
'''
cur = con.cursor()
cur.execute(query_create_table)
con.commit()

# Insert url page in table
url = input('Url de pesquisa: ')
query_insert_url_page = f'''
    INSERT INTO public.pages (page) VALUES ('{url}');
'''
cur = con.cursor()
cur.execute(query_insert_url_page)
con.commit()

# List pages
query_select = '''select * from public.pages'''
cur.execute(query_select)
print(cur.fetchall())

keyword = input('Pesquise aqui: ')
response = requests.get(url)
index = response.text.rfind(keyword)
print(response.text[index])

html = BeautifulSoup(response.text, 'html5lib')
links = html.find_all('a')

# ranking = {}
# for link in links:
#     if link.get('href'):
#         split = link['href'].split('https://g1.globo.com/')
#         if len(split) > 1:
#             if split[1].split('/')[0] not in ranking:
#                 ranking[split[1].split('/')[0]]=1
#             else:
#                 ranking[split[1].split('/')[0]]+=1

# print(ranking)