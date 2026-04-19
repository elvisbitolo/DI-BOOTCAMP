import random


class Card:
    def __init__(self, suit, value):
        self.suit = suit
        self.value = value

    def __repr__(self):
        return f"{self.value} of {self.suit}"


class Deck:
    def __init__(self):
        self.suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
        self.values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        self.cards = []
        self.build_deck()

    # Build 52 cards
    def build_deck(self):
        self.cards = [
            Card(suit, value)
            for suit in self.suits
            for value in self.values
        ]

    # Shuffle deck
    def shuffle(self):
        if len(self.cards) != 52:
            self.build_deck()

        random.shuffle(self.cards)

    # Deal one card
    def deal(self):
        if len(self.cards) == 0:
            return "No more cards in deck"

        return self.cards.pop()
deck = Deck()
deck.shuffle()
print(deck.deal())
print(deck.deal())
print(deck.deal())