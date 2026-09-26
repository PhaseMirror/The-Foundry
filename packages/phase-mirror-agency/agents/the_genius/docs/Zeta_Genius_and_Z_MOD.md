                   Zeta Genius and Z-MOD:
A Multiplicity-Theoretic, Zeta-Guided Optimization Framework
               for Analytic Multiplicity Probing
                                    Citizen Gardens
                              The Foundation of Multiplicity

                                        April 28, 2026


                                           Abstract
     This defensive publication describes the Zeta Genius project and the Z-MOD (Zeta-Mathematics
 Optimizer with Multiplicity Dynamics) framework as developed across multiple design and anal-
 ysis steps. Z-MOD is a hybrid continuous–discrete optimizer that embeds neural network pa-
 rameters into the complex plane via a multiplicity-theoretic mapping, couples updates to the
 Riemann zeta function and its zeros, and incorporates a discrete prime-multiplicity state. The
 document formalizes the geometric embedding, zeta potentials, zero-data-informed resonance
 layers, and multiplicity dynamics. It further specifies minimal PyTorch implementations, bench-
 mark protocols on MNIST and CIFAR-10, an ADR-based development roadmap, and analytic
 probes for distinguishing zeta-specific effects from generic structured oscillations. The intent is
 to create prior art around this family of constructions, preventing later patenting while enabling
 open research and extension.




                                                1
Contents
1 Executive Summary                                                                                    3

2 Background and Prior Art                                                                             4
  2.1 Classical optimization and adaptive methods . . . . . . . . . . . . . . . . . . . . . .          4
  2.2 Zeta-based optimization proposals . . . . . . . . . . . . . . . . . . . . . . . . . . . .        4
  2.3 Multiplicity theory and prime encoding . . . . . . . . . . . . . . . . . . . . . . . . .         4
  2.4 Novelty of Z-MOD . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       5

3 Mathematical Framework                                                                               5
  3.1 State space and embedding . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        5
  3.2 Base zeta potential and gradient . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       6
  3.3 Zero-data-informed resonance layer . . . . . . . . . . . . . . . . . . . . . . . . . . . .       7
  3.4 Multiplicity dynamics . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .      7
  3.5 Full objective with auxiliary layers . . . . . . . . . . . . . . . . . . . . . . . . . . . .     8

4 Algorithmic Design and Code Snippets                                                            8
  4.1 ZMODAdam optimizer skeleton . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
  4.2 MNIST training harness . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10

5 Benchmark Protocol and Analytic Multiplicity Probe                                                  11
  5.1 Ablation matrix on MNIST . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        11
  5.2 Metrics and statistical tests . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .   11
  5.3 Toy Rastrigin probe . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .     12

6 ADR Roadmap and Repository Scaffold                                                              12
  6.1 Phased ADR roadmap . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 12
  6.2 Repository structure . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13

7 Discussion and Recommendations                                                                    14
  7.1 Defensive publication scope . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
  7.2 Future work . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14

8 Finite-Width Spectral Effects, RH Deviations, and Convergence Limits in Z-
  MOD                                                                                           15
  8.1 Montgomery Pair Correlation and Z-MOD Dynamics . . . . . . . . . . . . . . . . . . 15
  8.2 RH Deviations and Lipschitz Stability . . . . . . . . . . . . . . . . . . . . . . . . . . 16
  8.3 Spectral Leakage in Truncated Resonance Bands . . . . . . . . . . . . . . . . . . . . 16
  8.4 Von Mangoldt Error-Term Regularization . . . . . . . . . . . . . . . . . . . . . . . . 17
  8.5 Finite-Width GUE Departures in Optimizer-Induced Spectra . . . . . . . . . . . . . 18

9 Conclusion                                                                                          18

A Clipped Energy Functional and Embedding                                                             19
  A.1 Definitions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19
  A.2 Basic properties . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19




                                                   2
B Zeta Potential: Regularity and Bounds                                                                20
  B.1 Definition of the base zeta potential . . . . . . . . . . . . . . . . . . . . . . . . . . .      20
  B.2 Continuity and boundedness on compact sets . . . . . . . . . . . . . . . . . . . . . .           20
  B.3 Gradient and local Lipschitz bounds . . . . . . . . . . . . . . . . . . . . . . . . . . .        21

C Zero-Resonance Layer: Regularity Proofs                                                              22
  C.1 Definition . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .   22
  C.2 Derivative with respect to θ . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .     22
  C.3 Lipschitzness on bounded sets . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .      23

D Operator Norm Bounds for the Combined Gradient                                                  23
  D.1 Combined gradient . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 23
  D.2 Operator norm bounds on compact sets . . . . . . . . . . . . . . . . . . . . . . . . . 23

E Remarks on Numerical Stability and Clipping                                                          24


1     Executive Summary
This publication records and formalizes a set of interconnected ideas and concrete artifacts devel-
oped under the “Zeta Genius” and “Z-MOD” umbrella.
   At a high level, the contributions are:

• A multiplicity-aware optimizer state space

                                    S = Rn × M,          M = {0, 1}m ,

    where θ ∈ Rn are continuous parameters and π ∈ M encodes discrete prime multiplicity modes.

• A canonical geometric embedding into the complex plane
                                                                            
                                                              X
                                s(θ, π) = σ0 + i a ϕ̃(θ) +         πp log p ,
                                                              p∈P


    with ϕ̃ a clipped parameter-energy functional and P a small prime set, e.g. {2, 3, 5}.

• A zeta-guided potential based on the Riemann zeta function
                                                                         
                                   Z0 (θ, π) = ℜ log |ζ(s(θ, π))| + ε ,

    and its exact logarithmic derivative ζ ′ /ζ pulled back through the embedding to define analytic
    gradients.

• A zero-data-informed resonance layer built from tabulated imaginary parts of zeta zeros, intro-
  ducing resonance bands and explicit-formula-inspired oscillations without assuming the Riemann
  Hypothesis:
                                                N                         2 !
                                             1 X          Im s(θ, π) − γn
                     ∆Zzeros (θ, π) = λzeros       exp −                       .
                                             N n=1               2σ 2

• A multiplicity dynamics layer that evolves π via a symmetric Metropolis–Hastings kernel on
  {0, 1}m , coupled to the zeta-informed objective.

                                                     3
• A minimal PyTorch implementation of ZMODAdam, a research optimizer that wraps Adam
  with togglable zeta scaling, auxiliary zeta losses, zero-resonance terms, and multiplicity flips,
  along with MNIST and CIFAR-10 training harnesses.

• A phased ADR (Architecture Decision Record) roadmap and repository scaffold for systematically
  developing, validating, and scaling Z-MOD, including specific benchmark matrices and logging
  formats.

• An analytic multiplicity probe design: toy Rastrigin experiments and MNIST ablations intended
  to distinguish three cases:

      1. Case A: no effect of zeta-specific structure.
      2. Case B: structured oscillation helps, but zeta zeros are not special.
      3. Case C: zeta-specific advantages that survive random-band and generic-oscillation controls.

    The combination of geometric embedding, zeta potentials, prime multiplicity, and zero-data-
informed resonance—implemented in a concrete optimizer and wrapped in an ADR-governed roadmap—
constitutes the core novelty of this prior art.


2     Background and Prior Art
2.1    Classical optimization and adaptive methods
Modern deep learning relies heavily on gradient-based optimizers such as SGD, momentum, RM-
SProp, and Adam, all of which operate on θ ∈ Rn without an explicit number-theoretic or complex-
analytic structure. Adam and its variants maintain exponential moving averages of gradients and
squared gradients and have become near-default optimizers for many tasks.
   There also exist optimizers and algorithms that incorporate notions of sharpness (e.g. SAM,
“Sharpness-Aware Minimization”) and noise injections, with empirical gains in generalization.
These methods shape the effective loss surface via local perturbation or reweighting, but they
typically do not explicitly reference zeta functions or prime distributions.

2.2    Zeta-based optimization proposals
Recent work such as ZetA (“Zeta Algorithm”) introduces scalar zeta-based scaling of gradients and
loss terms, reporting empirical gains on certain tasks. These designs typically:

• Use ζ as a scalar scaling factor in an otherwise standard optimizer (often Adam).

• Combine zeta scaling with additional regularizers (e.g. entropy, sharpness penalties).

As a result, the role of zeta-specific structure is entangled with other components, making it difficult
to isolate whether the arithmetic properties of ζ contribute anything beyond general structured
perturbations.

2.3    Multiplicity theory and prime encoding
The Zeta Genius project is grounded in a multiplicity-theoretic viewpoint: mathematical objects
and algorithmic states are modeled as patterns of prime-labeled interactions and recurrence across
scales. In this view, primes play the role of discrete modes or “colors” that modulate continuous


                                                   4
dynamics, and complex functions such as ζ encode spectral information about these multiplicity
patterns.
   The Z-MOD framework is designed precisely to make this multiplicity structure explicit in the
optimizer state:
                              S = Rn × M,       M = {0, 1}m ,
with M representing a finite prime-multiplicity subspace.

2.4    Novelty of Z-MOD
Compared to prior art:

• Z-MOD embeds optimizer parameters into the complex plane via a multiplicity-aware mapping
  s(θ, π), not merely through a scalar mapping of training step or loss.

• Z-MOD introduces a discrete prime multiset π and couples it to ζ and its zeros, yielding a hybrid
  continuous–discrete process.

• Z-MOD defines and implements zero-data-informed resonance layers based on tabulated zeros,
  and systematically compares them against random-band and generic-oscillation controls.

• The framework explicitly structures the development through ADRs, benchmark matrices, and
  analytic probes designed to falsifiably test zeta-specific contributions.

    To the author’s knowledge, no prior optimizer:

    1. Embeds (θ, π) into the complex plane in this multiplicity-theoretic manner, nor

    2. Uses tabulated zeros and GUE-like spacing heuristics as auxiliary losses and proposal reweight-
       ing within a gradient-based optimizer, nor

    3. Wraps such a design in a systematic ADR-based roadmap with concrete PyTorch artefacts
       as specified here.


3     Mathematical Framework
3.1    State space and embedding
Let n ∈ N be the number of continuous parameters and let P = {p1 , . . . , pm } be a fixed finite set
of primes, e.g. {2, 3, 5}. Define the discrete prime-multiplicity space

                                             M = {0, 1}m ,

and the full state space
                                             S = Rn × M.
   A point in S is denoted (θ, π) with θ ∈ Rn and π = (πp1 , . . . , πpm ) ∈ {0, 1}m .
   Define a base energy functional
                                                1
                                          ϕ(θ) = ∥θ∥2 ,
                                                n
and a clipped version                                     
                                    ϕ̃(θ) = min ϕ(θ), Φmax ,

                                                   5
for some fixed Φmax > 0.
    The canonical complex embedding is
                                                                                    
                                                                    X
                             s(θ, π) = σ0 + i a ϕ̃(θ) +                   πp log p ,           (1)
                                                                   p∈P

with parameters σ0 ∈ (0, 1) and a > 0. The imaginary part,
                                                                         X
                            t(θ, π) = Im s(θ, π) = a ϕ̃(θ) +                   πp log p,
                                                                         p∈P

acts as a scalar summary of both continuous and discrete state.

3.2   Base zeta potential and gradient
Define the base zeta potential by
                                                                                 
                                Z0 (θ, π) = ℜ log |ζ(s(θ, π))| + ε ,                             (2)

where ε > 0 is a small constant ensuring numerical stability.
   Let f (θ) be the task loss (e.g. cross-entropy) and define a prime-complexity penalty
                                                         X
                                              C(π) =           πp log p.
                                                         p∈P

   The full objective is
                               O(θ, π) = f (θ) + λZ0 (θ, π) + βC(π),                             (3)
with weights λ, β ≥ 0.
   For ϕ̃(θ) < Φmax , the chain rule yields an analytic gradient for the zeta term. Let s = s(θ, π),
and assume ζ(s) ̸= 0. Then                  ′
                                 ∂Z0         ζ (s)          |ζ(s)|
                                                       
                                      =ℜ           · ia ·            .
                                  ∂ϕ         ζ(s)         |ζ(s)| + ε
Because ϕ̃ is quadratic in θ, we have
                                                                2
                                                ∇θ ϕ̃(θ) =        θ,
                                                                n
and thus                               ′
                                     ℜ
                                        ζ (s)              |ζ(s)| 2
                                     
                                              · ia                     θ,        ϕ(θ) < Φmax ,
                    ∇θ Z0 (θ, π) =            ζ(s)        |ζ(s)| + ε n                           (4)
                                     
                                         0,                                      ϕ(θ) ≥ Φmax .
                                     

   The base gradient of O with respect to θ is then

                               ∇θ O(θ, π) = ∇θ f (θ) + λ∇θ Z0 (θ, π).                            (5)




                                                          6
3.3   Zero-data-informed resonance layer
To incorporate information about zeta zeros without assuming the Riemann Hypothesis, we intro-
duce a resonance layer based on tabulated zeros.
   Let {γn }N
            n=1 be the imaginary parts of the first N non-trivial zeros of ζ(s), i.e. zeros of the form
ρn = βn + iγn with 0 < βn < 1 and 0 < γ1 ≤ γ2 ≤ · · · . These are obtained from numerical tables
and are treated as empirical data.
   Define a Gaussian-band kernel over the imaginary axis:
                                               N
                                                                          !
                                            1 X         (t − γn )2
                                     R(t) =       exp −                       ,                    (6)
                                            N n=1          2σ 2

with σ > 0 controlling band width.
   We then define the zero-resonance auxiliary loss

                                   Lzero (θ, π) = αzero ϕ̃(θ) R(t(θ, π)),                          (7)

with αzero > 0 a small hyperparameter. This term increases when θ has large energy and Im s
lies near a zero ordinate, encouraging the optimizer to explore and respond differently near these
resonant bands.
    Additionally, to mimic explicit-formula-type oscillations, one may define
                               N
                               X                                                       
                   E(θ, π) =         wn cos γn log x(θ, π) ,       x(θ, π) = exp t(θ, π) ,         (8)
                               n=1

with decaying weights wn (e.g. wn = 1/n) and a separate coefficient λEF .
   The total zeta-informed potential becomes

                        Zinf (θ, π) = Z0 (θ, π) + ∆Zzeros (θ, π) + λEF E(θ, π),                    (9)

where ∆Zzeros is identified with Lzero or a closely related formulation.

3.4   Multiplicity dynamics
The prime-multiplicity state π ∈ {0, 1}m evolves via a Markov chain with Metropolis–Hastings
acceptance:

• Proposal: select index k ∈ {1, . . . , m} uniformly at random and define

                                              π ′ = π + ek       mod 2,

   where ek is the unit vector and addition is modulo 2.

• Acceptance probability:

                    α (θ, π) → (θ, π ′ ) = min 1, exp(−βMH (O(θ, π ′ ) − O(θ, π))) ,
                                                                                            


   where βMH > 0 is an inverse temperature.

   The resulting dynamics is a piecewise-deterministic process: θ evolves via gradient-based up-
dates on O (or a variant thereof), while π is updated intermittently via Metropolis proposals.

                                                      7
3.5   Full objective with auxiliary layers
Combining the components, the most complete objective in this publication has the form

           Ofull (θ, π) = f (θ) + λZ0 (θ, π) + λzeros ϕ̃(θ)R(t(θ, π)) + λEF E(θ, π) + βC(π).   (10)

    By toggling each coefficient independently, one can construct ablations that isolate:

• Scalar zeta scaling (λ ̸= 0, other terms off),

• Auxiliary zeta loss (λ ̸= 0 in combination with selected terms),

• Zero-resonance effects (λzeros ̸= 0),

• Explicit-formula-style oscillations (λEF ̸= 0),

• Multiplicity dynamics (β > 0 together with Metropolis updates).


4     Algorithmic Design and Code Snippets
4.1   ZMODAdam optimizer skeleton
The core optimizer described in the development thread is a research-oriented variant of Adam,
augmented with zeta and multiplicity features. In Python-like pseudocode:

                Listing 1: ZMODAdam skeleton with zero-resonance auxiliary loss
class ZMODAdam(torch.optim.Optimizer):
    def __init__(self, params, lr=1e-3,
                 use_zeta_scaling=False,
                 use_aux_zeta_loss=False,
                 use_prime_flips=False,
                 use_zero_resonance=False,
                 aux_zeta_weight=0.0,
                 zero_resonance_weight=0.0,
                 zero_band_sigma=5.0,
                 sigma0=0.6, a=0.1, phi_max=100.0,
                 primes=(2, 3, 5)):
        defaults = dict(lr=lr)
        super().__init__(params, defaults)
        self.use_zeta_scaling = use_zeta_scaling
        self.use_aux_zeta_loss = use_aux_zeta_loss
        self.use_prime_flips = use_prime_flips
        self.use_zero_resonance = use_zero_resonance
        self.aux_zeta_weight = aux_zeta_weight
        self.zero_resonance_weight = zero_resonance_weight
        self.zero_band_sigma = zero_band_sigma
        self.sigma0 = sigma0
        self.a = a
        self.phi_max = phi_max
        self.primes = torch.tensor(primes, dtype=torch.float64)
        # Preload zeros as a 1D tensor: gamma_1,...,gamma_N
        self.zero_gammas = load_riemann_zeros_tensor()
        # Adam state initialization omitted for brevity



                                                    8
def compute_phi_tensor(self):
    sq_sum = 0.0
    count = 0
    for group in self.param_groups:
        for p in group["params"]:
            if p.grad is None:
                continue
            sq_sum = sq_sum + (p.data ** 2).sum()
            count += p.data.numel()
    if count == 0:
        return torch.tensor(0.0, device=self.zero_gammas.device)
    phi = sq_sum / float(count)
    return torch.clamp(phi, max=self.phi_max)

def _prime_shift(self, pi_state):
    # pi_state: tensor of shape [len(primes)] with 0/1 entries
    return torch.dot(pi_state.to(self.primes.dtype), torch.log(self.primes))

def compute_auxiliary_loss(self, pi_state):
    params = [p for g in self.param_groups for p in g["params"] if p.requires_grad]
    if not params:
        return torch.tensor(0.0, device=self.zero_gammas.device)

    device = params[0].device
    loss = torch.zeros((), device=device)

    # Zero-resonance auxiliary term
    if self.use_zero_resonance and self.zero_resonance_weight != 0.0:
        phi = self.compute_phi_tensor()
        imag_s = self.a * phi + self._prime_shift(pi_state.to(device))
        gammas = self.zero_gammas.to(device)
        diff = imag_s - gammas
        sigma = self.zero_band_sigma
        kernel = torch.exp(-0.5 * (diff / sigma) ** 2)
        R = kernel.mean()
        loss = loss + self.zero_resonance_weight * phi * R

    # Additional auxiliary zeta or oscillation terms can be added here

    return loss

@torch.no_grad()
def step(self, closure=None, pi_state=None):
    # closure returns loss; pi_state is the current multiplicity vector
    loss = None
    if closure is not None:
        loss = closure()

    # Optionally add auxiliary loss
    if pi_state is None:
        pi_state = torch.zeros(len(self.primes), dtype=torch.int64)
    aux_loss = self.compute_auxiliary_loss(pi_state)
    if aux_loss.requires_grad:
        aux_loss.backward()


                                        9
        # Standard Adam update logic here (omitted for brevity)

        return loss

    This skeleton emphasizes the independence of features: zeta scaling, auxiliary losses, and zero
resonance are all toggled by explicit flags.

4.2   MNIST training harness
A minimal training script for MNIST classification using ZMODAdam might look as follows:
                      Listing 2: MNIST training harness with ZMODAdam
def train_mnist(model, optimizer, train_loader, device):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        logits = model(x)
        loss = F.cross_entropy(logits, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * x.size(0)
        preds = logits.argmax(dim=1)
        correct += (preds == y).sum().item()
        total += x.size(0)
    return total_loss / total, correct / total

def eval_mnist(model, data_loader, device):
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for x, y in data_loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            loss = F.cross_entropy(logits, y)
            total_loss += loss.item() * x.size(0)
            preds = logits.argmax(dim=1)
            correct += (preds == y).sum().item()
            total += x.size(0)
    return total_loss / total, correct / total

def main():
    # Data, model, optimizer setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MNISTMLP().to(device)
    optimizer = ZMODAdam(
        model.parameters(), lr=1e-3,
        use_zeta_scaling=False,


                                                10
          use_aux_zeta_loss=False,
          use_prime_flips=False,
          use_zero_resonance=True,
          zero_resonance_weight=1e-4,
          zero_band_sigma=5.0
      )
      # Training loop
      for epoch in range(1, 21):
          train_loss, train_acc = train_mnist(model, optimizer, train_loader, device)
          test_loss, test_acc = eval_mnist(model, test_loader, device)
          print(f"Epoch␣{epoch}:␣"
                f"train_loss={train_loss:.4f},␣train_acc={train_acc:.3f},␣"
                f"test_loss={test_loss:.4f},␣test_acc={test_acc:.3f})")

   Additional logging (e.g. Im s, resonance scores, π occupancy) can be added as described in the
roadmap.


5     Benchmark Protocol and Analytic Multiplicity Probe
5.1    Ablation matrix on MNIST
To empirically isolate the effect of zeta-specific structure, the framework defines a benchmark matrix
on MNIST with (at minimum) the following methods:

                Block          Method
                Base           Adam
                Control        Adam + matched Gaussian gradient noise
                Control        Adam + periodic scalar modulation
                Zeta           Adam + scalar zeta scaling
                Geometry       Adam + auxiliary zeta loss (no multiplicity)
                Multiplicity   ZMODAdam + prime flips (no zero resonance)
                Resonance      ZMODAdam + zero-resonance layer (real zeros)
                Control        ZMODAdam + random-band resonance (fake zeros)

   Each method is run for 5 seeds with fixed data pipeline, batch size, learning rate schedule, and
number of epochs.

5.2    Metrics and statistical tests
Primary metrics:

• Test accuracy as a function of epoch.

• Training loss as a function of epoch.

• Wall-clock time per epoch and per full run.

• Approximate “escape time”: the epoch index at which test accuracy first exceeds a threshold
  (e.g. 98%).

    Secondary metrics:


                                                 11
• Generalization gap (train vs test loss).

• Mean and variance of Im s across epochs.

• Mean resonance score ϕ̃R(t).

• Prime occupancy statistics (frequency of πp = 1 in final states).

    The primary analytic multiplicity probe on MNIST uses these metrics to distinguish:

• Case A: zero-resonance (real zeros) no better than random-band and baseline.

• Case B: zero-resonance and random-band both improve over baseline but are indistinguishable
  from each other.

• Case C: zero-resonance improves over both random-band and baseline with statistically signifi-
  cant differences (e.g. Mann–Whitney p < 0.01).

5.3   Toy Rastrigin probe
In addition to MNIST, a 2D Rastrigin-based probe is defined:

• Landscape: f (θ) is the 2D Rastrigin function.

• Optimizers: SGD, SGD+noise, generic sine-oscillation baseline, Z-MOD without resonance, Z-
  MOD with resonance.

• Metrics: number of iterations to reach f (θ) < ε, Im s(t) trajectories, prime occupancy, and
  resonance scores.

  This toy probe can be run quickly on a CPU to obtain early Case A/B/C indications before
moving to MNIST and CIFAR-10.


6     ADR Roadmap and Repository Scaffold
6.1   Phased ADR roadmap
To ensure disciplined development, the project is organized into phases with associated ADRs,
including (non-exhaustively):

• ADR-000: Project scope and falsifiability.

• ADR-001: Metrics and evidence policy.

• ADR-010: Canonical embedding specification.

• ADR-020: ZMODAdam core design.

• ADR-030: Prime multiset dynamics.

• ADR-040: Zero-resonance layer (zero-data-informed).

• ADR-050: MNIST benchmark matrix.


                                                12
• ADR-051: CIFAR-10 benchmark matrix.

• ADR-060: Reproducibility and artifact packaging.

   Each ADR documents:

• The decision and context.

• Alternatives considered.

• Rationale and consequences.

• Validation plan and file impacts.

6.2   Repository structure
A recommended repository structure is:

zmod/
 README.md
 pyproject.toml
 requirements.txt
 data/
    zeros/
        riemann_zeros_first_100.txt
        riemann_zeros_first_1000.txt
 configs/
    mnist_base.yaml
    mnist_zeta_scaling.yaml
    mnist_zero_resonance.yaml
    cifar10_base.yaml
    cifar10_zmod.yaml
 docs/
    adrs/
    validation/
 src/
    zmod/
        embedding.py
        multiplicity.py
        resonance.py
        logging_utils.py
        metrics.py
        models/
        optim/
 scripts/
    train_mnist.py
    train_cifar10.py
    run_mnist_sweep.py
    run_cifar10_sweep.py
    plot_benchmarks.py


                                             13
 tests/
 results/
 reports/

    This structure aligns code, configs, data, tests, and documentation around the Z-MOD design,
easing reproducibility and extension.


7     Discussion and Recommendations
7.1   Defensive publication scope
The key claim of this defensive publication is not that Z-MOD is superior to all existing optimizers,
but that the following design space is now prior art:

• Optimizers that embed (θ, π) into the complex plane via a multiplicity-weighted mapping.

• Use of ζ and ζ ′ /ζ as potential terms and gradient modifiers in such embeddings.

• Use of small prime sets and Boolean multiplicity vectors as auxiliary optimizer state.

• Use of tabulated zeta zeros and their empirical statistics as auxiliary losses and proposal biases
  via resonance bands and explicit-formula-style oscillations.

• Systematic ADR-governed development with benchmark protocols designed to test zeta-specificity
  via ablations.

    Any future attempt to patent this family of methods should be precluded by the existence of
this description and associated code.

7.2   Future work
The current design suggests several natural extensions:

• Larger P and richer multiplicity spaces (beyond {2, 3, 5}).

• Alternative embeddings (layer-wise energies, gradient-based energies, or spectral norms).

• Incorporation of higher-level number-theoretic functions (e.g. Dirichlet L-functions) for special-
  ized tasks.

• Application to zeta-algorithm families such as prime prediction, encryption, signal processing,
  Schrödinger dynamics, and chaos models.

    Any such extensions, if they reuse the core pattern of (θ, π) embedding, zeta potentials, and
zero-data-informed resonance, should be understood as lying within the conceptual scope of this
defensive publication.




                                                 14
8        Finite-Width Spectral Effects, RH Deviations, and Convergence
         Limits in Z-MOD
This section analyzes how finite-width spectral effects, deviations from the Riemann Hypothesis
(RH), and explicit-formula truncation constrain what can be claimed about the convergence of
Z-MOD. The key message is that convergence must be justified by analytic properties of the im-
plemented kernels and standard stochastic-approximation arguments, not by Montgomery’s pair
correlation conjecture or RH themselves.

8.1        Montgomery Pair Correlation and Z-MOD Dynamics
Montgomery’s pair correlation conjecture (PCC) describes the limiting two-point correlation of
normalized ordinates of non-trivial zeros of the Riemann zeta function on the critical line.1 After
appropriate normalization to unit mean spacing, the conjectured pair correlation function is
                                                                            2
                                                                  sin(πu)
                                                              
                                               R2 (u) = 1 −                      ,
                                                                     πu
which is identical to the sine-kernel law for eigenvalues of large Gaussian Unitary Ensemble (GUE)
matrices.
    Z-MOD does not directly operate on the zero set of ζ; instead, it induces a “spectral” process
via the imaginary part of its embedding
                                                    tk = Im s(θk , πk ),
where (θk , πk ) is the optimizer state at iteration k. The resonance layer uses a finite subset {γn }Nn=1
of zero ordinates as parameters in smooth kernels (e.g., Gaussian bands or cosine sums), but the
dynamics of {tk } is governed by both these kernels and the underlying task loss f (θ).
    [PCC does not imply Z-MOD convergence] Even under RH and the truth of Montgomery’s
PCC, no convergence guarantee for Z-MOD follows directly from PCC. The PCC is an asymptotic
statistical statement about normalized zero spacings; Z-MOD uses a finite, truncated, and smoothed
kernel built from a finite prefix of zero ordinates, and its state evolution is driven by gradient descent
on a task-dependent objective rather than by sampling from the zero point process.

Proof. Montgomery’s PCC concerns the limit as the height T → ∞ of the pair correlation of zeros
in the range [0, T ], after an explicit normalization. By contrast, Z-MOD uses a fixed finite set
{γn }N
     n=1 and constructs a smooth kernel such as
                                                      N
                                                                                     !
                                                   1 X         (t − γn )2
                                          RN (t) =       exp −                           .
                                                   N n=1          2σ 2
The optimizer evolution is then
                                     θk+1 = θk − ηk (∇f (θk ) + g(θk , πk ) + ξk ) ,
where g encodes zeta and resonance contributions and ξk is stochastic noise. The distribution of
{tk } is a complicated function of f , {γn }, the kernel, and the noise; it is not a sample from the
zero process. Thus the asymptotic pair correlation statistics of zeros do not, by themselves, control
the trajectory of {θk } or imply any almost-sure convergence to critical points of an objective.
Convergence must instead be derived from local regularity and step-size conditions for the specific
vector field used by Z-MOD.
    1
        See, e.g., Montgomery’s original work and expository sources for the precise statement and its GUE interpretation.


                                                             15
8.2    RH Deviations and Lipschitz Stability
Many explicit-formula constructions naturally assume that zeros lie on the critical line, i.e., that
each non-trivial zero has the form ρn = 12 + iγn . To model possible deviations from RH, write
                                             ρn = 12 + δn + iγn ,
with δn ∈ R describing horizontal deviations from the critical line. In a truncated explicit-formula-
inspired auxiliary loss of the form
                                       N
                                                      x(θ, π)ρn
                                       X                            
                    LVM (θ, π) = λVM         wn ℜ                        ,   x(θ, π) = et(θ,π) ,
                                       n=1
                                                         ρn

these deviations appear as amplitude factors xδn .
    [Lipschitz constant under horizontal deviations] Suppose t(θ, π) is restricted to a compact in-
terval [−Tmax , Tmax ], so that x(θ, π) = et(θ,π) lies in [e−Tmax , eTmax ]. Assume |δn | ≤ ∆ for all zeros
used in LVM . Then the Lipschitz constant of ∇θ LVM on any compact set in parameter space grows
at most by a factor of e∆Tmax relative to the RH-idealized case δn = 0.
Proof. For each term,
                                     ℜ xρn = x1/2+δn cos(γn log x),
                                           

so |ℜ(xρn )| ≤ x1/2+|δn | . On the domain x ∈ [e−Tmax , eTmax ], we have x|δn | ≤ e|δn |Tmax ≤ e∆Tmax .
Thus, compared to the case δn = 0, each term’s magnitude is inflated by at most e∆Tmax . The
gradient ∇θ LVM involves a common factor of
                                                N
                                                X
                                                     wn ℜ xρn
                                                                 

                                               n=1

times ∇θ t(θ, π), which is independent of δn . Therefore the operator norm and the Lipschitz constant
of ∇θ LVM are inflated by at most the same factor e∆Tmax , up to fixed multiplicative constants
depending on {wn } and the bounds on ∇θ t on the compact set.
    This lemma illustrates why clipping ϕ̃(θ) and thereby controlling the range of t(θ, π) is critical:
it bounds the potential impact of RH deviations on the regularity of the auxiliary gradient field.

8.3    Spectral Leakage in Truncated Resonance Bands
The resonance layer uses a truncated zero set to build a smooth kernel
                                   N
                                                                                         !
                                1 X                                            u2
                       RN (t) =       Kσ (t − γn ),             Kσ (u) = exp − 2             ,
                                N n=1                                         2σ

where {γn }N
           n=1 are the imaginary parts of the first N non-trivial zeros and σ > 0 is a bandwidth
parameter. Let µ be the formal discrete measure of all zeros (or of a large window thereof),
                                                       X
                                                µ=           δγn .
                                                       n≥1

Then the “ideal” infinite-kernel resonance would involve
                                                       M
                                                    1 X
                                      R∞ (t) =            Kσ (t − γn )
                                                    M n=1
for M → ∞ in an appropriate sense, or, more conceptually, (µ ∗ Kσ )(t).
    Truncation introduces two types of spectral leakage:

                                                       16
     1. Tail leakage. Omitting zeros with n > N eliminates their contribution, so the difference
                                              1 X
                          R∞ (t) − RN (t) =         Kσ (t − γn ) + normalization error
                                              M n>N

         represents missing tail energy. Even if the high zeros are individually small contributors, the
         cumulative effect may bias the kernel, especially for large |t| away from the first N zeros.
     2. Bandwidth leakage. Finite σ smooths fine-scale spacing structure. Close zeros with spacing
        much smaller than σ produce overlapping bands, effectively merging distinct spectral features
        into a single broad peak. This suppresses the high-frequency structure encoded in the pair
        correlation statistics and replaces it by a blurred approximation.

    From the point of view of Z-MOD, spectral leakage means that the auxiliary gradient derived
from RN (t) encodes a low-rank, band-limited summary of zero statistics rather than the full fine-
grained structure. As N grows and σ decreases, leakage can be reduced but at the cost of increased
numerical stiffness and potential instability in the gradient field.

8.4      Von Mangoldt Error-Term Regularization
The classical explicit formula for the Chebyshev function ψ(x) can be written schematically as
                                                     X xρn
                                      ψ(x) = x −                  + ET (x),
                                                   |γ |<T
                                                          ρn
                                                     n


where the sum runs over zeros with |γn | < T and ET (x) collects the tail contributions and additional
explicit terms.2
    In a Z-MOD-inspired auxiliary loss, one might use the truncated oscillatory part as in LVM and
introduce an error-term regularizer
                                                              2
                          Rerr (θ, π) = λerr ET (x(θ, π)) ,          x(θ, π) = et(θ,π) .

If explicit bounds of the form |ET (x)| ≤ BT (x) are available on a relevant range of x, a practical
surrogate is
                                  Rsur                             2
                                     err (θ, π) = λerr BT (x(θ, π)) ,

which penalizes optimizer states where explicit-formula truncation is expected to be unreliable.
   Differentiating the exact error-term penalty yields

                              ∇θ Rerr (θ, π) = 2λerr ET (x) ET′ (x) ∇θ x(θ, π),

with ∇θ x = x ∇θ t and ∇θ t = a∇θ ϕ̃(θ). In the unclipped region,
                                                               2
                                         ∇θ x(θ, π) = x(θ, π) a θ,
                                                               n
so
                                                                               2
                    ∇θ Rerr (θ, π) = 2λerr ET (x(θ, π)) ET′ (x(θ, π)) x(θ, π) a θ.
                                                                               n
Even if ET is not known exactly, using an upper bound BT or a numerically estimated surrogate
for the magnitude of the omitted tail allows Z-MOD to damp regions where the truncated explicit
formula is most questionable, stabilizing the influence of the von Mangoldt-based auxiliary terms.
     2
    Different normalizations and additional terms (such as contributions from the pole at s = 1 and from trivial
zeros) appear in standard references; here we isolate the truncated zero sum and its remainder.


                                                         17
8.5    Finite-Width GUE Departures in Optimizer-Induced Spectra
GUE universality is an asymptotic phenomenon: as the size of random matrices grows, their local
eigenvalue statistics in the bulk converge to universal forms such as the sine kernel. In Z-MOD,
several finite-width effects guarantee deviations from exact GUE behaviour:

    • Only finitely many zeros are used in the resonance layer.

    • The sequence {tk } is not sampled from a stationary point process but generated by a non-
      stationary optimization dynamic that depends on the task loss.

    • Gaussian smoothing with width σ further blurs the spectrum, effectively convolving the dis-
      crete zero measure with a smooth kernel.

    • The embedded heights tk are constrained by clipping of ϕ̃ and by the optimizer’s step-size
      schedule.

    Thus any empirical pair correlation function R   b 2 (u) derived from normalized {tk } will, at best,
approximate a smoothed and biased version of the GUE sine kernel on certain scales and windows.
Rather than expecting exact universality, one should treat GUE statistics as a benchmark shape:
the closer R
           b 2 (u) is to the sine kernel on appropriate windows, the more faithfully Z-MOD’s induced
spectral density reflects the structure of the underlying zero data.
    From the standpoint of convergence, these finite-width departures are not problematic. The
convergence of Z-MOD relies on the boundedness and Lipschitz properties of its kernelized gradients
and on standard stochastic approximation conditions. GUE universality and Montgomery’s PCC
serve as design heuristics for the shape of the resonance kernel, not as analytic ingredients in the
convergence proofs.
    The correct division of labour is therefore:
    • Use analytic number theory—explicit formulas, zero data, and PCC/GUE intuition—to
      choose and tune the kernels RN (t) and explicit-formula-inspired terms in a way that is nu-
      merically stable and structurally interpretable.

    • Use functional analysis and stochastic approximation theory to prove that, for the chosen
      kernels, the resulting gradient field is sufficiently regular (e.g., locally Lipschitz and bounded)
      to ensure convergence to stationary points under appropriate step-size and noise assumptions.
This separation ensures that any failures or refinements of RH or PCC affect the interpretation and
shape of the kernels but not the logical soundness of the convergence arguments.


9     Conclusion
This document has formalized the Zeta Genius and Z-MOD developments into a coherent math-
ematical, algorithmic, and architectural specification. It introduced the multiplicity-aware state
space, the canonical complex embedding, zeta-guided potentials, zero-data-informed resonance lay-
ers, multiplicity dynamics, PyTorch implementation sketches, and a phased ADR roadmap with
benchmark protocols.
    The combination of these elements constitutes a concrete prior art for zeta-guided, multiplicity-
theoretic optimization frameworks. It is designed to support open scientific investigation of whether
zeta-specific structure can genuinely affect optimization, while preventing later enclosure of the
underlying ideas via patenting.

                                                   18
Mathematical Appendix
This appendix collects the explicit proofs, norm bounds, and auxiliary lemmas underlying the
constructions used in the Z-MOD framework. The aim is to make the analytic foundations of the
embedding, zeta potential, and zero-resonance layer completely explicit and self-contained.
    Throughout, n ∈ N denotes the number of continuous parameters, P = {p1 , . . . , pm } a fixed
finite set of primes, and M = {0, 1}m the associated multiplicity space.


A     Clipped Energy Functional and Embedding
A.1    Definitions
Let θ ∈ Rn and define
                                                           n
                                               1        1X
                                      ϕ(θ) =     ∥θ∥2 =      θ2 .
                                               n        n i=1 i
Fix a clipping threshold Φmax > 0 and define
                                                                    
                                      ϕ̃(θ) = min ϕ(θ), Φmax .

    For a multiplicity vector π = (πp1 , . . . , πpm ) ∈ M, define the canonical complex embedding
                                                             X            
                              s(θ, π) = σ0 + i a ϕ̃(θ) +            πp log p ,                   (11)
                                                              p∈P

with fixed parameters σ0 ∈ (0, 1) and a > 0.

A.2    Basic properties
[Continuity and boundedness of ϕ̃] For all θ ∈ Rn , ϕ̃(θ) is continuous, non-negative, and satisfies

                                           0 ≤ ϕ̃(θ) ≤ Φmax .
                                                                  1/2
Moreover, ϕ̃ is globally Lipschitz with constant Lϕ = √2n Φmax .

Proof. Continuity and non-negativity are immediate since ϕ(θ) = n1 ∥θ∥2 is continuous and non-
negative, and the minimum of continuous functions is continuous.
   The bound ϕ̃(θ) ≤ Φmax follows directly from the definition ϕ̃(θ) = min(ϕ(θ), Φmax ). Non-
negativity is preserved under min(·, Φmax ).
   To establish the Lipschitz bound, note that for any θ, θ′ ∈ Rn ,

                                   |ϕ̃(θ) − ϕ̃(θ′ )| ≤ |ϕ(θ) − ϕ(θ′ )|,

since clipping cannot increase differences. Now
                                          1                   1
                        ϕ(θ) − ϕ(θ′ ) =     (∥θ∥2 − ∥θ′ ∥2 ) = ⟨θ + θ′ , θ − θ′ ⟩,
                                          n                   n
and hence
                                                     1
                                |ϕ(θ) − ϕ(θ′ )| ≤      ∥θ + θ′ ∥ · ∥θ − θ′ ∥.
                                                     n


                                                     19
Whenever ϕ(θ) ≤ Φmax and ϕ(θ′ ) ≤ Φmax , we have
                                  ∥θ∥2 ≤ nΦmax , ∥θ′ ∥2 ≤ nΦmax ,
                                   √
whence ∥θ + θ′ ∥ ≤ ∥θ∥ + ∥θ′ ∥ ≤ 2 nΦmax . Thus on the sublevel set {θ : ϕ(θ) ≤ Φmax },
                                        √
                                 ′     2 nΦmax               2
                     |ϕ(θ) − ϕ(θ )| ≤           ∥θ − θ′ ∥ = √ Φ1/2  ∥θ − θ′ ∥.
                                          n                   n max
When one of ϕ(θ) or ϕ(θ′ ) exceeds Φmax , the difference is bounded by Φmax itself, while ∥θ −θ′ ∥ ≥ 0;
                                                                     1/2
combining both cases yields a global Lipschitz constant Lϕ = √2n Φmax .

    [Lipschitz property of s] For fixed π ∈ M, the map θ 7→ s(θ, π) is globally Lipschitz with
respect to the Euclidean norm, with constant
                                                       2
                                         Ls = aLϕ = a √ Φ1/2  .
                                                        n max
Moreover, |Im s(θ, π)| is bounded linearly in ∥θ∥ on sublevel sets of ϕ.

Proof. The dependence of s on θ is solely through ϕ̃(θ) in its imaginary part; the real part σ0 and
the prime-shift sum depend only on π. Hence
                         |s(θ, π) − s(θ′ , π)| = a |ϕ̃(θ) − ϕ̃(θ′ )| ≤ aLϕ ∥θ − θ′ ∥,
by the previous lemma.
   On any set where ϕ(θ) ≤ Φmax , we have ϕ̃(θ) = ϕ(θ) and
                                                  X                         X
                        |Im s(θ, π)| ≤ aϕ(θ) +         | log p| ≤ aΦmax +         log p,
                                                 p∈P                        p∈P

so the imaginary part is bounded on that set. For large ∥θ∥, ϕ̃ is clipped at Φmax and the same
bound holds.


B     Zeta Potential: Regularity and Bounds
B.1    Definition of the base zeta potential
For (θ, π) ∈ S define
                                            s(θ, π) as in (11),
and let ε > 0 be fixed. The base zeta potential is
                                                                        
                                   Z0 (θ, π) = ℜ log |ζ(s(θ, π))| + ε .                           (12)

B.2    Continuity and boundedness on compact sets
[Continuity of Z0 ] For each fixed π ∈ M, the map θ 7→ Z0 (θ, π) is continuous on Rn .

Proof. The composition of continuous maps is continuous. From the previous section, θ 7→ s(θ, π)
is continuous. The Riemann zeta function ζ(s) is holomorphic on {s ∈ C : ℜ(s) ̸= 1}, with a
simple pole at s = 1. By construction, σ0 ∈ (0, 1) is fixed and never equals 1, so s(θ, π) avoids
the pole. Therefore, ζ(s(θ, π)) is well-defined and continuous. The maps z 7→ |z|, x 7→ x + ε,
and x 7→ log(x) are continuous on (0, ∞), hence the composition is continuous. Taking real part
preserves continuity, so θ 7→ Z0 (θ, π) is continuous.

                                                     20
  [Boundedness on compact sets] Let K ⊂ Rn be compact. Then for fixed π ∈ M, there exists
MK > 0 such that for all θ ∈ K,
                                    |Z0 (θ, π)| ≤ MK .

Proof. The image of K under the continuous map θ 7→ s(θ, π) is a compact set SK ⊂ {s : ℜ(s) =
σ0 }. Since ζ(s) is continuous on SK and SK avoids s = 1, there exists M > 0 such that |ζ(s)| ≤ M
for all s ∈ SK . Also |ζ(s)| ≥ 0. Thus for θ ∈ K,

    |Z0 (θ, π)| = ℜ log(|ζ(s(θ, π))| + ε) ≤ log(|ζ(s(θ, π))| + ε) ≤ max{| log ε|, | log(M + ε)|}.

Set MK = max{| log ε|, | log(M + ε)|}.

B.3    Gradient and local Lipschitz bounds
On any open region where |ζ(s)| > 0, i.e. s avoids zeros of ζ, we can differentiate Z0 with respect
to ϕ:

                     ∂Z0    ζ ′ (s) ∂s                |ζ(s)|      ζ ′ (s)          |ζ(s)|
                                                                                 
                         =ℜ        ·            ·              =ℜ         · ia ·            .
                     ∂ϕ     ζ(s) ∂ϕ                 |ζ(s)| + ε    ζ(s)           |ζ(s)| + ε
   Furthermore,
                                                                2
                                                    ∇θ ϕ(θ) =     θ,
                                                                n
so for ϕ(θ) < Φmax we have
                                           ′
                                           ζ (s(θ, π))          |ζ(s(θ, π))|   2
                                                                
                       ∇θ Z0 (θ, π) = ℜ                · ia ·                 · θ.                  (13)
                                           ζ(s(θ, π))         |ζ(s(θ, π))| + ε n

For ϕ(θ) ≥ Φmax , we define ∇θ Z0 to be zero, reflecting the clipping in ϕ̃.
    [Local Lipschitzness of ∇θ Z0 ] Let K ⊂ Rn be a compact set such that for all θ ∈ K and π ∈ M,
s(θ, π) avoids zeros of ζ. Then there exists LK > 0 such that

                             ∥∇θ Z0 (θ, π) − ∇θ Z0 (θ′ , π)∥ ≤ LK ∥θ − θ′ ∥

for all θ, θ′ ∈ K.

Proof. On K, both s(θ, π) and θ are contained in compact sets, and ζ ′ /ζ is continuous since s
avoids zeros. The maps

                                           ζ ′ (s(θ, π))                     |ζ(s(θ, π))|
                          θ 7→ θ,   θ 7→                 ,      θ 7→
                                           ζ(s(θ, π))                      |ζ(s(θ, π))| + ε

are all continuous on K and attain finite maxima there. The expression for ∇θ Z0 in (13) is a
product of these bounded continuous functions and θ, so it is Lipschitz on K by standard results
about smooth functions on compact domains and the equivalence of norms. Explicitly, one may
bound ∥∇θ Z0 (θ, π)∥ by CK ∥θ∥ for some CK > 0, and differentiate again to see that the Jacobian
is bounded, yielding the desired Lipschitz constant.




                                                          21
C      Zero-Resonance Layer: Regularity Proofs
C.1    Definition
Let {γn }N
         n=1 be fixed real numbers (e.g. the first N imaginary parts of non-trivial zeros of ζ). For
t ∈ R define
                                            N
                                         1 X           (t − γn )2
                                                                 
                                R(t) =          exp −
                                         N n=1            2σ 2
for some σ > 0.
    Given t(θ, π) = Im s(θ, π) and ϕ̃(θ) as before, the zero-resonance auxiliary loss is

                                 Lzero (θ, π) = αzero ϕ̃(θ) R(t(θ, π)).

C.2    Derivative with respect to θ
We first compute R′ (t):
                                      N
                                   1 X               (t − γn )2            t − γn
                                                                              
                            ′
                           R (t) =       exp       −               ·     −        .
                                   N n=1                2σ 2                 σ2

    If we restrict to the region where ϕ(θ) < Φmax , we have ϕ̃(θ) = ϕ(θ) and
                                                          X
                                    t(θ, π) = aϕ(θ) +           πp log p.
                                                          p∈P

Then
                                     ∂t                            2
                                        = a,          ∇θ ϕ(θ) =      θ.
                                     ∂ϕ                            n
By the chain rule,
                                                   ∂t              2
                                  ∇θ t(θ, π) =        ∇θ ϕ(θ) = a · θ.
                                                   ∂ϕ              n
    Using the product rule,
                                                                                       
              ∇θ Lzero (θ, π) = αzero ∇θ ϕ̃(θ) R(t(θ, π)) + ϕ̃(θ) R′ (t(θ, π)) ∇θ t(θ, π) .

Inside the unclipped region,
                                                                  2
                                         ∇θ ϕ̃(θ) = ∇θ ϕ(θ) =       θ,
                                                                  n
and
                                                          2
                                            ∇θ t(θ, π) = a θ.
                                                          n
Thus
                                         2                                       2
                  ∇θ Lzero (θ, π) = αzero θ R(t(θ, π)) + αzero ϕ̃(θ)R′ (t(θ, π))a θ.           (14)
                                         n                                       n
Outside the unclipped region (ϕ(θ) ≥ Φmax ), one may set ∇θ Lzero = 0 by design.




                                                     22
C.3     Lipschitzness on bounded sets
[Boundedness of R and R′ ] For all t ∈ R,

                                                                                  C
                                                0 < R(t) ≤ 1,        |R′ (t)| ≤
                                                                                  σ
for some constant C > 0 depending only on {γn } and σ.
                                                                                      2
Proof. Each term in the sum defining R(t) is of the form exp(− (t−γ n)
                                                                 2σ 2
                                                                       ), which lies strictly between
0 and 1. Hence 0 < R(t) ≤ 1.
   For R′ (t), note that for each n,

                         (t − γn )2           t − γn   1                      1                     K
                                     
                                                                2    2                     2
           exp       −                    ·          ≤ 2 sup e−x /(2σ ) |x| = 2 · σ sup e−y /2 |y| = ,
                            2σ 2                σ2    σ x∈R                  σ      y∈R             σ

for some K > 0. Averaging over n preserves the bound, so |R′ (t)| ≤ K/σ.

   [Local Lipschitzness of ∇θ Lzero ] Let K ⊂ Rn be a compact set on which ϕ(θ) < Φmax for all
θ ∈ K. Then there exists Lzero                         ′
                           K > 0 such that for all θ, θ ∈ K and all π ∈ M,

                               ∥∇θ Lzero (θ, π) − ∇θ Lzero (θ′ , π)∥ ≤ Lzero    ′
                                                                        K ∥θ − θ ∥.

Proof. Within K, both ϕ̃(θ) = ϕ(θ) and t(θ, π) are smooth functions of θ, with derivatives bounded
on K due to compactness. Expression (14) shows that ∇θ Lzero is a linear combination (with
bounded coefficients) of θ and functions of t(θ, π). Since R and R′ are bounded and smooth in t
and t is Lipschitz in θ, standard composition rules imply that ∇θ Lzero is Lipschitz on K. An explicit
constant can be obtained by bounding the derivatives of t, R, and R′ on K, but the existence of
Lzero
 K    suffices here.


D      Operator Norm Bounds for the Combined Gradient
D.1     Combined gradient
The full objective (with zero-resonance but without explicit-formula cosine term) is

                             Ofull (θ, π) = f (θ) + λZ0 (θ, π) + Lzero (θ, π) + βC(π).

The gradient with respect to θ in the unclipped region can be written as

                           ∇θ Ofull (θ, π) = ∇θ f (θ) + λ∇θ Z0 (θ, π) + ∇θ Lzero (θ, π).

D.2     Operator norm bounds on compact sets
[Local Lipschitz bound for ∇θ Ofull ] Let K ⊂ Rn be a compact set such that:

    1. ϕ(θ) < Φmax for all θ ∈ K;

    2. s(θ, π) avoids zeros of ζ for all θ ∈ K and π ∈ M;

    3. ∇θ f is Lipschitz on K with constant LfK .



                                                                23
Then there exists a constant Lfull
                              K > 0 such that

                            ∥∇θ Ofull (θ, π) − ∇θ Ofull (θ′ , π)∥ ≤ Lfull    ′
                                                                     K ∥θ − θ ∥

for all θ, θ′ ∈ K and all π ∈ M.

Proof. From the assumptions, ∇θ f is Lipschitz on K with constant LfK . From the previous lemmas,
∇θ Z0 and ∇θ Lzero are Lipschitz on K with constants LZ 0
                                                       K and LK
                                                                zero respectively (depending on λ,

αzero , and the choice of N , {γn }, σ). Thus

      ∥∇θ Ofull (θ, π) − ∇θ Ofull (θ′ , π)∥ ≤ ∥∇θ f (θ) − ∇θ f (θ′ )∥ + λ∥∇θ Z0 (θ, π) − ∇θ Z0 (θ′ , π)∥
                                            + ∥∇θ Lzero (θ, π) − ∇θ Lzero (θ′ , π)∥
                                          ≤ LfK + λLZ    zero
                                                              ∥θ − θ′ ∥.
                                                      0
                                                                   
                                                    K + LK

              f     Z0
Setting Lfull            zero yields the claim.
         K = LK + λLK + LK


E    Remarks on Numerical Stability and Clipping
The theoretical results above justify the use of clipping in ϕ̃(θ) and in Im s from the standpoint of
preserving Lipschitzness and boundedness of the zeta potentials and their gradients on regions of
interest.
    From a practical perspective:
• Clipping ensures Im s remains within a manageable numerical range for evaluating ζ(s) and
  R(t).

• The auxiliary loss Lzero inherits good regularity properties from the Gaussian kernel structure
  of R.

• Operator norm bounds on the Hessians (or Jacobians of the gradients) on compact sets can be
  obtained by differentiating the expressions above, though explicit closed forms are increasingly
  cumbersome.
    Nevertheless, the key property required for the optimizer design is that ∇θ Ofull is locally Lips-
chitz in θ on relevant parameter regions, which the lemmas and theorem provide.


References
 [1] E. C. Titchmarsh. The Theory of the Riemann Zeta-Function. Oxford University Press, 2
     edition, 1986. Revised by D. R. Heath-Brown.

 [2] Aleksandar Ivić. The Riemann Zeta-Function: Theory and Applications. Dover, 2003. Reprint
     of John Wiley & Sons, 1985.

 [3] Harold M. Edwards. Riemann’s Zeta Function. Dover, 2001. Reprint of Academic Press, 1974.

 [4] Aleksandar Ivić. The Riemann Zeta-Function and the Distribution of Prime Numbers. Amer-
     ican Mathematical Society, 2003.

 [5] Hans von Mangoldt. Zu riemanns abhandlung über die anzahl der primzahlen unter einer
     gegebenen größe. Journal für die reine und angewandte Mathematik, 114:255–305, 1895.

                                                     24
 [6] Helge von Koch. Sur la distribution des nombres premiers. Acta Mathematica, 24:159–182,
     1901.

 [7] Hugh L. Montgomery. The pair correlation of zeros of the zeta function. Analytic Number
     Theory, Proceedings of Symposia in Pure Mathematics, 24:181–193, 1973.

 [8] Andrew M. Odlyzko. On the distribution of spacings between zeros of the zeta function.
     Mathematics of Computation, 48(177):273–308, 1987.

 [9] Andrew M. Odlyzko. The 1020 -th zero of the riemann zeta function and 70 million of its
     neighbors. Preprint, 1989. Zero tables widely used for empirical studies.

[10] E. B. Bogomolny and J. P. Keating. Random matrix theory and the riemann zeta func-
     tion: Gutzwiller’s trace formula and the riemann–siegel formula. Physical Review Letters,
     77(8):1472–1475, 1996.

[11] Michael V. Berry. Riemann’s zeta function: A model for quantum chaos? Lecture Notes in
     Physics, 263:1–17, 1986.

[12] Jeffrey C. Lagarias. An elementary problem equivalent to the riemann hypothesis. American
     Mathematical Monthly, 109(6):534–543, 2002.

[13] Jonathan M. Borwein, Peter B. Borwein, William F. Galway, and Roland Girgensohn. Com-
     putational strategies for the riemann zeta function. Journal of Computational and Applied
     Mathematics, 121(1–2):247–296, 2000.

[14] Hugh L. Montgomery and Robert C. Vaughan. Multiplicative Number Theory I. Classical
     Theory. Cambridge University Press, 2007.

[15] Jean-Pierre Serre. A Course in Arithmetic. Springer, 1973.

[16] Peter Sarnak. Spectra of hyperbolic surfaces. Bulletin of the American Mathematical Society,
     40(4):441–478, 2003.

[17] Nicholas Glorioso. Deficiency identity for zeta values and optimal approximation. arXiv
     preprint, 2026. Deficiency-based representation and approximation framework for zeta values.

[18] Diederik P. Kingma and Jimmy Ba. Adam: A method for stochastic optimization. Interna-
     tional Conference on Learning Representations (ICLR), 2015.

[19] Pierre Foret, Ariel Kleiner, Hosein Mobahi, and Behnam Neyshabur. Sharpness-aware min-
     imization for efficiently improving generalization. In International Conference on Learning
     Representations (ICLR), 2021.

[20] Wei Zhang, Ming Li, Rohan Kumar, and Alice Smith. A riemann zeta-scaled extension of
     adam for deep learning. arXiv preprint, 2025. Proposes ZetA, a zeta-scaled variant of Adam
     with entropy and SAM-style regularization.

[21] Kaiming He, Xiangyu Zhang, Shaoqing Ren, and Jian Sun. Deep residual learning for im-
     age recognition. In Proceedings of the IEEE Conference on Computer Vision and Pattern
     Recognition (CVPR), pages 770–778, 2016.

[22] Yann LeCun, Léon Bottou, Yoshua Bengio, and Patrick Haffner. Gradient-based learning
     applied to document recognition. Proceedings of the IEEE, 86(11):2278–2324, 1998.

                                               25
[23] Andrew M. Odlyzko. Tables of zeros of the riemann zeta function. Available from the author’s
     homepage; widely used in numerical investigations of zero statistics.

[24] Edward Gardner and Bernard Derrida. Optimal storage properties of neural network models.
     Journal of Physics A: Mathematical and General, 21(1):271–284, 1988. Classical work on
     energy landscapes and storage capacity.

[25] Yuji Nakatsukasa and Coauthors. Emergence of a resonance in machine learning. Physical
     Review Research, 5(3):033127, 2023.

[26] Hyman Bass. Algebraic K-Theory. W. A. Benjamin, 1968. Classical reference on multiplicative
     structures in algebra.

[27] Tsit-Yuen Lam. Exercises in Classical Algebraic K-Theory. Springer, 1973.

[28] Andrew M. Odlyzko. On the distribution of spacings between zeros of the zeta function. Math-
     ematics of Computation, 48(177):273–308, 1987. Computational evidence for Montgomery’s
     pair correlation conjecture and GUE statistics.

[29] Eric W. Weisstein. Montgomery’s pair correlation conjecture. From MathWorld–A Wolfram
     Web Resource. Accessible overview of the conjecture and its GUE connection.

[30] E. Rinne. Riemann zero spacings and montgomery’s pair correlation conjecture. Master’s
     Thesis, Simon Fraser University, 2002. Expository treatment of PCC, GUE universality, and
     zero-spacing statistics.

[31] Steven J. Miller and Steven M. Gonek. Pair correlation of the zeros of the riemann zeta-
     function. Talk notes, 2004. Slides summarizing Montgomery’s theorem, conjecture, and
     random-matrix connections.

[32] Aleksandar Ivić. The Riemann Zeta-Function: Theory and Applications. Dover, 2003. Detailed
     treatment of explicit formulas, error terms, and zero-density estimates.

[33] Kiran S. Kedlaya. Von mangoldt’s formula. Lecture notes, Chapter 9 in analytic number
     theory course, 2014. Introduction to the Riemann–von Mangoldt explicit formula for ψ(x) and
     related error terms.

[34] Steven J. Miller. Explicit formula for logarithmic derivative of riemann zeta function. Lecture
     notes, 2005. Derivation and discussion of an explicit formula for ζ ′ /ζ and applications.




                                                26
