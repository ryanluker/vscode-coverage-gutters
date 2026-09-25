// C example with multi-conditional branches in a single file
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

// Compute a score with layered conditions and short-circuit logic
int score_user(int age, int yearsActive, int posts, bool verified) {
    int score = 0;

    if (age < 0 || yearsActive < 0 || posts < 0) {
        return -1; // invalid
    }

    if ((age >= 18 && verified) || (yearsActive > 5 && posts > 100)) {
        score += 25;
    } else if ((age >= 16 && yearsActive >= 1) && (verified || posts > 10)) {
        score += 10;
    } else {
        score += 1;
    }

    if ((posts > 500 && yearsActive > 3) || (verified && posts > 250)) {
        score += 50;
    } else if (posts > 50 && yearsActive > 1) {
        score += 15;
    } else if (posts == 0 && !verified) {
        score -= 5;
    }

    // tiering bonus
    if ((age > 30 && yearsActive > 10 && verified) || (age > 50 && posts > 50)) {
        score += 10;
    }

    return score;
}

// Categorize risk with nested combinations
const char* risk_category(int creditScore, int latePayments, double debtRatio,
                          bool isStudent, bool hasJob) {
    if (creditScore < 0 || creditScore > 850 || debtRatio < 0.0) {
        return "invalid";
    }

    if ((creditScore >= 750 && latePayments == 0 && debtRatio < 0.3) ||
        (creditScore >= 700 && latePayments <= 1 && debtRatio < 0.25)) {
        return "low";
    }

    if ((creditScore >= 650 && latePayments <= 2 && debtRatio < 0.4 && hasJob) ||
        (isStudent && creditScore >= 620 && debtRatio < 0.35)) {
        return "medium";
    }

    if ((creditScore < 600 && latePayments > 2) || debtRatio > 0.6) {
        return "high";
    }

    return "unknown";
}

// Complex boolean decision utilizing flags (bitmask)
// flags: bit0=require2FA, bit1=admin, bit2=readOnly, bit3=trial
bool allow_action(int hour24, int failedLogins, int flags, bool emailVerified) {
    bool require2FA = (flags & 0x1) != 0;
    bool isAdmin    = (flags & 0x2) != 0;
    bool readOnly   = (flags & 0x4) != 0;
    bool trial      = (flags & 0x8) != 0;

    if (readOnly) {
        return false;
    }

    if ((hour24 < 6 || hour24 > 22) && !isAdmin) {
        return false;
    }

    if ((failedLogins >= 3 && !isAdmin) || (!emailVerified && require2FA)) {
        return false;
    }

    if (trial && require2FA && !emailVerified) {
        return false;
    }

    return true;
}

// String utility with mixed conditions
int word_score(const char* s) {
    if (s == NULL || s[0] == '\0') return 0;

    int vowels = 0, consonants = 0, digits = 0, others = 0;
    for (size_t i = 0; s[i] != '\0'; ++i) {
        char c = s[i];
        if ((c >= '0' && c <= '9')) { digits++; continue; }
        char lower = (c >= 'A' && c <= 'Z') ? (char)(c + 32) : c;
        if (lower=='a'||lower=='e'||lower=='i'||lower=='o'||lower=='u') vowels++;
        else if (lower >= 'a' && lower <= 'z') consonants++;
        else others++;
    }

    int score = vowels*2 + consonants - (digits>0 ? 1:0) - others;
    if ((vowels >= 3 && consonants >= 3) || (digits >= 2 && others == 0)) score += 5;
    if ((vowels == 0 && consonants > 5) || (others > 3)) score -= 3;
    return score;
}

// Multi-conditional numerical routine
int bounded_transform(int x, int y, int z) {
    int res = 0;
    if ((x > 0 && y > 0 && z > 0) && (x + y > z) && (y + z > x) && (x + z > y)) {
        // triangle-ish constraints
        res = x*y + z;
    } else if ((x <= 0 || y <= 0) && z > 100) {
        res = z - (x + y);
    } else if ((x == 0 && y == 0 && z == 0) || (x == y && y == z)) {
        res = x + y + z;
    } else {
        res = x - y + z;
    }

    if ((res % 2 == 0 && (x & 1) == 1) || (res % 3 == 0 && (y & 1) == 0)) {
        res += 7;
    }
    return res;
}

int main(void) {
    printf("Running C coverage example (single-file, complex branches)\n");

    // Exercise multiple code paths but leave some branches uncovered on purpose
    printf("score_user A: %d\n", score_user(19, 0, 5, true));
    printf("score_user B: %d\n", score_user(35, 12, 60, true));
    printf("score_user C: %d\n", score_user(15, 0, 0, false));

    printf("risk low: %s\n", risk_category(760, 0, 0.2, false, true));
    printf("risk med: %s\n", risk_category(655, 2, 0.33, true, false));
    printf("risk high: %s\n", risk_category(580, 3, 0.7, false, false));

    printf("allow_action 1: %d\n", allow_action(14, 0, 0x0, true));
    printf("allow_action 2: %d\n", allow_action(23, 4, 0x1, false));
    printf("allow_action 3: %d\n", allow_action(7, 2, 0x2, true));

    printf("word_score(foo42): %d\n", word_score("foo42"));
    printf("word_score(STRong!): %d\n", word_score("STRong!"));
    printf("word_score(vowels): %d\n", word_score("aeiouxyz"));

    printf("bounded_transform A: %d\n", bounded_transform(3,4,5));
    printf("bounded_transform B: %d\n", bounded_transform(-1,0,150));
    printf("bounded_transform C: %d\n", bounded_transform(2,2,2));

    return 0;
}
