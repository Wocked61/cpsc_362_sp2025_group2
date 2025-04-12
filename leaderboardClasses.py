class Player:
    def __init__(self, name, wins=0, losses=0, streak=0):
        self.name = name
        self.wins = wins
        self.losses = losses
        self.streak = streak

    def win(self):
        self.wins = self.wins + 1
        if self.streak > 0:
            self.streak = self.streak + 1
        else:
            self.streak = 1

    def lose(self):
        self.losses = self.losses + 1
        if self.streak < 0:
            self.streak = self.streak - 1
        else:
            self.streak = -1



class Leaderboard:
    def __init__(self):
        self.players = {}

    def add_player(self, n):
        if n in self.players:
            print(f"{n} is present on the leaderboard.")
        else:
            self.players[n] = Player(n)
            print(f"{n} was added.")

    def record_win(self, n):
        player = self.players.get(n)
        if player:
            player.win()
            print(f"{n} now has {player.wins} wins. Streak: {player.streak}")
        else:
            print(f"{n} not found.")

    def record_loss(self, n):
        player = self.players.get(n)
        if player:
            player.lose()
            print(f"{n} now has {player.losses} losses. Streak: {player.streak}")
        else:
            print(f"{n} not found.")

    def show(self):
        if not self.players:
            print("Leaderboard is empty.")
            return
        print(f"{'Name':<12} {'Wins':<6} {'Losses':<8} {'Streak':<6}")
        print("-" * 36)
        for p in sorted(self.players.values(), key=lambda x: x.wins, reverse=True):
            print(f"{p.n:<12} {p.wins:<6} {p.losses:<8} {p.streak:<6}")

    def save(self, filename):
        with open(filename, 'w') as file:
            file.write(f"{'Name:':<12} {'Wins:':<8} {'Losses:':<10} {'Streak:':<7}\n")
            file.write("-" * 40 + "\n")
            for p in sorted(self.players.values(), key=lambda x: x.wins, reverse=True):
                file.write(f"{p.n:<12} {p.wins:<8} {p.losses:<10} {p.streak:<7}\n")
        print(f"Leaderboard saved to {filename}.")

    def load(self, filename):
        try:
            with open(filename, 'r') as file:
                for line in file:
                    n, wins, losses, streak = line.strip().split(',')
                    self.players[n] = Player(n, int(wins), int(losses), int(streak))
        except FileNotFoundError:
            print("No saved data was found.")
