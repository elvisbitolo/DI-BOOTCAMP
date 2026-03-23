# EXERCISE 1: CATS
class Cat:
    def __init__(self, cat_name, cat_age):
        self.name = cat_name
        self.age = cat_age


def find_oldest_cat(cat1, cat2, cat3):
    oldest = cat1

    if cat2.age > oldest.age:
        oldest = cat2
    if cat3.age > oldest.age:
        oldest = cat3

    return oldest


# Create cats
cat1 = Cat("Whiskers", 3)
cat2 = Cat("Shadow", 5)
cat3 = Cat("Milo", 2)

oldest_cat = find_oldest_cat(cat1, cat2, cat3)
print(f"The oldest cat is {oldest_cat.name}, and is {oldest_cat.age} years old.\n")

#EXERCISE 2: DOGS
class Dog:
    def __init__(self, name, height):
        self.name = name
        self.height = height

    def bark(self):
        print(f"{self.name} goes woof!")

    def jump(self):
        print(f"{self.name} jumps {self.height * 2} cm high!")


# Create dogs
davids_dog = Dog("Rex", 50)
sarahs_dog = Dog("Bella", 40)

# Use methods
print(davids_dog.name, davids_dog.height)
davids_dog.bark()
davids_dog.jump()

print()

print(sarahs_dog.name, sarahs_dog.height)
sarahs_dog.bark()
sarahs_dog.jump()

# Compare
if davids_dog.height > sarahs_dog.height:
    print(f"{davids_dog.name} is taller.\n")
else:
    print(f"{sarahs_dog.name} is taller.\n")


# EXERCISE 3: SONG

class Song:
    def __init__(self, lyrics):
        self.lyrics = lyrics

    def sing_me_a_song(self):
        for line in self.lyrics:
            print(line)


song = Song([
    "There’s a lady who's sure",
    "all that glitters is gold",
    "and she’s buying a stairway to heaven"
])

song.sing_me_a_song()
print()

# EXERCISE 4: ZOO

class Zoo:
    def __init__(self, zoo_name):
        self.zoo_name = zoo_name
        self.animals = []
        self.grouped_animals = {}

    def add_animal(self, *new_animals):
        for animal in new_animals:
            if animal not in self.animals:
                self.animals.append(animal)

    def get_animals(self):
        print("Animals:", self.animals)

    def sell_animal(self, animal_sold):
        if animal_sold in self.animals:
            self.animals.remove(animal_sold)

    def sort_animals(self):
        self.animals.sort()
        grouped = {}

        for animal in self.animals:
            first_letter = animal[0]
            if first_letter not in grouped:
                grouped[first_letter] = []
            grouped[first_letter].append(animal)

        self.grouped_animals = grouped

    def get_groups(self):
        for letter, animals in self.grouped_animals.items():
            print(f"{letter}: {animals}")


# Create zoo
brooklyn_safari = Zoo("Brooklyn Safari")

brooklyn_safari.add_animal(
    "Giraffe", "Bear", "Baboon",
    "Lion", "Zebra", "Cat", "Cougar"
)

brooklyn_safari.get_animals()

brooklyn_safari.sell_animal("Bear")
brooklyn_safari.get_animals()

brooklyn_safari.sort_animals()
brooklyn_safari.get_groups()
