// C++ example: single file, complex multi-conditional branches
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

struct User {
    std::string name;
    int age;
    int yearsActive;
    int posts;
    bool verified;
};

class Engine {
public:
    static int userScore(const User& u) {
        int score = 0;
        if ((u.age >= 18 && u.verified) || (u.yearsActive > 5 && u.posts > 100)) {
            score += 25;
        } else if ((u.age >= 16 && u.yearsActive >= 1) && (u.verified || u.posts > 10)) {
            score += 10;
        } else {
            score += 1;
        }

        if ((u.posts > 500 && u.yearsActive > 3) || (u.verified && u.posts > 250)) {
            score += 50;
        } else if (u.posts > 50 && u.yearsActive > 1) {
            score += 15;
        } else if (u.posts == 0 && !u.verified) {
            score -= 5;
        }

        if ((u.age > 30 && u.yearsActive > 10 && u.verified) || (u.age > 50 && u.posts > 50)) {
            score += 10;
        }
        return score;
    }

    static std::string riskCategory(int creditScore, int latePayments, double debtRatio,
                                    bool isStudent, bool hasJob) {
        if (creditScore < 0 || creditScore > 850 || debtRatio < 0.0) return "invalid";

        if ((creditScore >= 750 && latePayments == 0 && debtRatio < 0.30) ||
            (creditScore >= 700 && latePayments <= 1 && debtRatio < 0.25)) {
            return "low";
        }
        if ((creditScore >= 650 && latePayments <= 2 && debtRatio < 0.40 && hasJob) ||
            (isStudent && creditScore >= 620 && debtRatio < 0.35)) {
            return "medium";
        }
        if ((creditScore < 600 && latePayments > 2) || debtRatio > 0.60) return "high";
        return "unknown";
    }

    // flags: bit0=require2FA, bit1=admin, bit2=readOnly, bit3=trial
    static bool allowAction(int hour24, int failedLogins, int flags, bool emailVerified) {
        bool require2FA = (flags & 0x1) != 0;
        bool isAdmin    = (flags & 0x2) != 0;
        bool readOnly   = (flags & 0x4) != 0;
        bool trial      = (flags & 0x8) != 0;

        if (readOnly) return false;
        if ((hour24 < 6 || hour24 > 22) && !isAdmin) return false;
        if ((failedLogins >= 3 && !isAdmin) || (!emailVerified && require2FA)) return false;
        if (trial && require2FA && !emailVerified) return false;
        return true;
    }

    static int wordScore(const std::string& s) {
        if (s.empty()) return 0;
        int vowels=0, consonants=0, digits=0, others=0;
        for (char c: s) {
            if (c >= '0' && c <= '9') { digits++; continue; }
            char lower = (c >= 'A' && c <= 'Z') ? char(c + 32) : c;
            if (lower=='a'||lower=='e'||lower=='i'||lower=='o'||lower=='u') vowels++;
            else if (lower >= 'a' && lower <= 'z') consonants++;
            else others++;
        }
        int score = vowels*2 + consonants - (digits>0 ? 1:0) - others;
        if ((vowels >= 3 && consonants >= 3) || (digits >= 2 && others == 0)) score += 5;
        if ((vowels == 0 && consonants > 5) || (others > 3)) score -= 3;
        return score;
    }

    static int boundedTransform(int x, int y, int z) {
        int res = 0;
        if ((x > 0 && y > 0 && z > 0) && (x + y > z) && (y + z > x) && (x + z > y)) {
            res = x*y + z;
        } else if ((x <= 0 || y <= 0) && z > 100) {
            res = z - (x + y);
        } else if ((x == 0 && y == 0 && z == 0) || (x == y && y == z)) {
            res = x + y + z;
        } else {
            res = x - y + z;
        }
        if ((res % 2 == 0 && (x & 1)) || (res % 3 == 0 && (y % 2 == 0))) res += 7;
        return res;
    }
};

int main() {
    std::cout << "Running C++ coverage example (single-file, complex branches)\n";

    User a{"Ann", 19, 0, 5, true};
    User b{"Bob", 35, 12, 60, true};
    User c{"Cid", 15, 0, 0, false};
    std::cout << "score A: " << Engine::userScore(a) << "\n";
    std::cout << "score B: " << Engine::userScore(b) << "\n";
    std::cout << "score C: " << Engine::userScore(c) << "\n";

    std::cout << "risk low: " << Engine::riskCategory(760,0,0.2,false,true) << "\n";
    std::cout << "risk med: " << Engine::riskCategory(655,2,0.33,true,false) << "\n";
    std::cout << "risk high: " << Engine::riskCategory(580,3,0.7,false,false) << "\n";

    std::cout << "allow 1: " << Engine::allowAction(14,0,0x0,true) << "\n";
    std::cout << "allow 2: " << Engine::allowAction(23,4,0x1,false) << "\n";
    std::cout << "allow 3: " << Engine::allowAction(7,2,0x2,true) << "\n";

    std::cout << "word foo42: " << Engine::wordScore("foo42") << "\n";
    std::cout << "word STRong!: " << Engine::wordScore("STRong!") << "\n";
    std::cout << "word aeiouxyz: " << Engine::wordScore("aeiouxyz") << "\n";

    std::cout << "bt A: " << Engine::boundedTransform(3,4,5) << "\n";
    std::cout << "bt B: " << Engine::boundedTransform(-1,0,150) << "\n";
    std::cout << "bt C: " << Engine::boundedTransform(2,2,2) << "\n";
    return 0;
}
