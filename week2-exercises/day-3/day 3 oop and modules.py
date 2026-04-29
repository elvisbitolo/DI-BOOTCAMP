# ===== EXERCISE 1 =====
class Currency:
    def __init__(self, currency, amount):
        self.currency = currency
        self.amount = amount

    def __str__(self):
        return f"{self.amount} {self.currency}s"

    def __repr__(self):
        return self.__str__()

    def __int__(self):
        return self.amount

    def __add__(self, other):
        if isinstance(other, int):
            return self.amount + other
        if isinstance(other, Currency):
            if self.currency != other.currency:
                raise TypeError(f"Cannot add between Currency type <{self.currency}> and <{other.currency}>")
            return self.amount + other.amount

    def __iadd__(self, other):
        if isinstance(other, int):
            self.amount += other
        elif isinstance(other, Currency):
            if self.currency != other.currency:
                raise TypeError(f"Cannot add between Currency type <{self.currency}> and <{other.currency}>")
            self.amount += other.amount
        return self


c1 = Currency('dollar', 5)
c2 = Currency('dollar', 10)
c3 = Currency('shekel', 1)

print(c1)
print(int(c1))
print(repr(c1))
print(c1 + 5)
print(c1 + c2)

c1 += 5
print(c1)

c1 += c2
print(c1)

# print(c1 + c3)  # will crash


# ===== EXERCISE 2 =====
def sum_numbers(a, b):
    print(a + b)

sum_numbers(3, 7)


# ===== EXERCISE 3 =====
import string
import random

letters = string.ascii_letters
random_str = ''.join(random.choice(letters) for _ in range(5))
print(random_str)


# ===== EXERCISE 4 =====
from datetime import datetime

def current_date():
    print(datetime.now().date())

current_date()


# ===== EXERCISE 5 =====
def time_until_new_year():
    now = datetime.now()
    next_year = datetime(now.year + 1, 1, 1)
    print(next_year - now)

time_until_new_year()


# ===== EXERCISE 6 =====
def minutes_lived(birthdate_str):
    birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")
    now = datetime.now()
    minutes = int((now - birthdate).total_seconds() / 60)
    print(minutes)

minutes_lived("2000-01-01")


# ===== EXERCISE 7 =====
from faker import Faker

fake = Faker()
users = []

def generate_users(n):
    for _ in range(n):
        users.append({
            "name": fake.name(),
            "address": fake.address(),
            "language_code": fake.language_code()
        })

generate_users(3)
print(users)