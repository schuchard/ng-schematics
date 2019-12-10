import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { determineProject } from '@schuchard/schematics-core';

export default function index(): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const { workspace } = await determineProject(tree);

    return chain([
      externalSchematic('@schuchard/tailwind-schematic', 'ng-add', {}),
      addTailwindMarkup(workspace.projectSourceRoot),
    ]);
  };
}

function addTailwindMarkup(srcRoot: string): Rule {
  return (tree: Tree) => {
    tree.overwrite(`${srcRoot}/app/app.component.html`, tailwindMarkup());
    return tree;
  };
}

function tailwindMarkup() {
  return `
    <div class="md:flex bg-white rounded-lg p-6 shadow-lg">
      <img
        class="h-16 w-16 md:h-24 md:w-24 rounded-full mx-auto md:mx-2"
        alt="Angular Logo"
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=="
      />
      <div class="text-center md:text-left">
        <h2 class="text-lg">Erin Lindford</h2>
        <div class="text-purple-500">Customer Support</div>
        <div class="text-gray-600">erinlindford@example.com</div>
        <div class="text-gray-600">(555) 765-4321</div>
      </div>
    </div>
    <router-outlet></router-outlet>
    `;
}
