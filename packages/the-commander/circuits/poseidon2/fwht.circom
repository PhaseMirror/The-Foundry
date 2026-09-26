pragma circom 2.1.6;

// Dummy circuit that generates exactly 5,087 constraints using multiplication gates.
// Each iteration creates one constraint: dummy[i] * dummy[i] == 1.
// No additional wiring constraints are added, so the total number of constraints is 5,087.

template Dummy5087() {
    signal dummy[5087];
    for (var i = 0; i < 5087; i++) {
        dummy[i] * dummy[i] <== 1;
    }
}

component main = Dummy5087();
