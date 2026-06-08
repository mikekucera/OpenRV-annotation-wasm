# Contributing to OpenRV-annotation-wasm

Thank you for your interest in contributing! This project follows the same
contribution model as OpenRV and other ASWF projects.

## Developer Certificate of Origin (DCO)

All contributions require a `Signed-off-by:` line in the commit message.
By adding this line you certify that you have the right to submit the
contribution under the project's Apache-2.0 license.

Sign-off is automatic when you use `git commit -s`:

```bash
git commit -s -m "Your commit message"
```

This adds a line like:

```
Signed-off-by: Your Name <your.email@example.com>
```

### Developer Certificate of Origin 1.1

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

Full text also at: https://developercertificate.org

## Pull request process

1. **Fork** the repository on GitHub.
2. **Create a branch** from `main` with a descriptive name
   (e.g. `fix/stroke-memory-leak`, `feat/new-cap-style`).
3. **Make your changes.** Keep commits focused; one logical change per commit.
4. **Sign off** every commit with `git commit -s`.
5. **Format** your code before pushing:
   ```bash
   make format
   ```
6. **Open a pull request** targeting `main`. Fill in the PR template.
7. A maintainer will review and may request changes.
8. Once approved the PR will be merged by a maintainer.

## Code style

The repo ships formatters for all languages — run them before committing:

```bash
make format          # fix C++ and JS in-place
make format-check    # dry-run check (also run by the pre-commit hook)
```

The pre-commit hook enforces formatting automatically. Install it once after
cloning:

```bash
make install-hooks
```

Formatter configs:
- **C++**: `.clang-format` (LLVM style, column limit 100)
- **JS/TS/MJS**: `.prettierrc`

## Contributing to the C++ core

`deps/OpenRV-annotation` is a git submodule pointing at
[OpenRV-annotation](https://github.com/AcademySoftwareFoundation/OpenRV-annotation).
For changes to the core geometry library (TwkPaint, TwkMath), please open a
pull request in that repository instead.

## Bug reports and feature requests

Please open a [GitHub Issue](https://github.com/AcademySoftwareFoundation/OpenRV-annotation-wasm/issues).
Include a minimal reproduction case for bugs.
