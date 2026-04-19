import math

class Circle:
    def __init__(self, radius=None, diameter=None):
        if radius is not None:
            self._radius = radius
        elif diameter is not None:
            self._radius = diameter / 2
        else:
            raise ValueError("You must provide either radius or diameter")

    # 🔹 Decorator for radius
    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        self._radius = value

    # 🔹 Decorator for diameter
    @property
    def diameter(self):
        return self._radius * 2

    @diameter.setter
    def diameter(self, value):
        self._radius = value / 2

    # ✅ Area calculation
    def area(self):
        return math.pi * (self._radius ** 2)

    # ✅ String representation
    def __str__(self):
        return f"Circle(radius={self.radius:.2f})"

    # ✅ Add two circles → new circle
    def __add__(self, other):
        if isinstance(other, Circle):
            return Circle(radius=self.radius + other.radius)
        return NotImplemented

    # ✅ Greater than
    def __gt__(self, other):
        return self.radius > other.radius

    # ✅ Equal
    def __eq__(self, other):
        return self.radius == other.radius

    # ✅ Less than (needed for sorting)
    def __lt__(self, other):
        return self.radius < other.radius


# 🔥 Testing everything
c1 = Circle(radius=5)
c2 = Circle(diameter=10)  # radius = 5
c3 = Circle(radius=7)

print(c1)                 # Circle(radius=5.00)
print(c1.area())          # Area

# ➕ Add
c4 = c1 + c3
print(c4)                 # New circle

# 🔍 Comparisons
print(c1 > c3)            # False
print(c1 == c2)           # True

# 📊 Sorting
circles = [c1, c2, c3, c4]
circles.sort()

print("\nSorted Circles:")
for c in circles:
    print(c)