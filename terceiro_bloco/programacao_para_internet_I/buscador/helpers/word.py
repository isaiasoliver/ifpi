class Word:
    def get_text(self, text: str, word: str) -> str:
        index = text.rfind(word)
        p1=text[index:index+40]
        p2=text[index+40:index]
        return p1+p2