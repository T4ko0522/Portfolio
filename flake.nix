{
  description = "Portfolio development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

      # NixOS's system-wide dynamic linker stub rejects workerd. Keep the
      # glibc loader scoped to this project's development shell instead.
      workerdLauncher = pkgs.writeShellScriptBin "workerd-nix" ''
        set -eu

        for workerd in "$PWD"/node_modules/.pnpm/@cloudflare+workerd-linux-64@*/node_modules/@cloudflare/workerd-linux-64/bin/workerd; do
          if [ -x "$workerd" ]; then
            exec ${pkgs.nix-ld}/bin/nix-ld "$workerd" "$@"
          fi
        done

        printf '%s\n' "workerd binary not found. Run pnpm install in the project root." >&2
        exit 1
      '';
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = [
          pkgs.nodejs_22
          pkgs.pnpm_10
          pkgs.just
          pkgs.glibc
          pkgs.nix-ld
          workerdLauncher
        ];

        # Miniflare reads this variable when it starts its workerd process.
        MINIFLARE_WORKERD_PATH = "${workerdLauncher}/bin/workerd-nix";

        # Make the permitted loader explicit and available only in this shell.
        NIX_LD = "${pkgs.glibc}/lib/ld-linux-x86-64.so.2";
        NIX_LD_LIBRARY_PATH = "${pkgs.glibc}/lib";
      };
    };
}
