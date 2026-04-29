def sort_words():
    # Challenge 1: Sorting
    words = input("Enter words separated by commas: ")

    # Split, clean spaces, and sort
    word_list = [word.strip() for word in words.split(",")]
    word_list.sort()

    # Join back into string
    sorted_words = ",".join(word_list)

    print("Sorted words:", sorted_words)


def longest_word(sentence):
    # Challenge 2: Longest Word
    words = sentence.split()
    longest = words[0]

    for word in words:
        if len(word) > len(longest):
            longest = word

    return longest


def main():
    sort_words()

    print()  # spacing

    # Run Challenge 2
    sentence = input("Enter a sentence: ")
    print("Longest word:", longest_word(sentence))


# Run the program
if __name__ == "__main__":
    main()