const BASE_OPERATORS = ['∨', '∧', '¬', '→', '↔', '←', '(', ')'];
const EXTRA_OPERATORS = {
  or: '∨',
  and: '∧',
  not: '¬',
  implies: '→',
  impl: '→',
  '->': '→',
  '<->': '↔',
  '==': '↔',
  '<-': '←',
};

export const tokenise = (input) => {
  let tokens = [];

  for (const char of input) {
    if (BASE_OPERATORS.includes(char)) {
      tokens.push({ type: 'op', str: char });
    } else if (/\s/g.test(char)) {
      if (tokens.length == 0 || tokens[tokens.length - 1].type != 'sp') {
        tokens.push({ type: 'sp' });
      }
    } else {
      if (tokens.length != 0 && tokens[tokens.length - 1].type == 'str') {
        tokens[tokens.length - 1].str += char;
      } else {
        tokens.push({ type: 'str', str: char });
      }
    }
  }

  return tokens
    .filter((tok) => tok.type != 'sp')
    .map((tok) => {
      if (
        tok.type == 'str' &&
        Object.keys(EXTRA_OPERATORS).includes(tok.str.toLowerCase())
      ) {
        return { type: 'op', str: EXTRA_OPERATORS[tok.str.toLowerCase()] };
      } else {
        return tok;
      }
    });
};

function push_with_depth(tree, obj, depth) {
  if (depth == 0) {
    tree.push(obj);
  } else if (depth < 0) {
    throw 'cannot push with negative depth';
  } else {
    if (tree.length == 0 || !Array.isArray(tree[tree.length - 1])) {
      tree.push([]);
    }
    push_with_depth(tree[tree.length - 1], obj, depth - 1);
  }
}

function split_by_parens(tokens) {
  let tree = [];
  let depth = 0;

  tokens.forEach((token) => {
    if (token.type == 'op' && token.str == '(') {
      depth++;

      while (tree.length == 1 && Array.isArray(tree[0])) {
        tree = tree[0];
        depth--;
      }
    } else if (token.type == 'op' && token.str == ')') {
      depth--;

      while (depth < 0) {
        tree = [tree];
        depth++;
      }
    } else {
      push_with_depth(tree, token, depth);
    }
  });

  return tree;
}

function combine_unary(tree) {
  const result = [];

  tree.reverse();
  tree.forEach((node) => {
    if (Array.isArray(node)) {
      result.unshift(combine_unary(node));
    } else if (node.type == 'op' && node.str == '¬') {
      result.unshift([node, result.shift()]);
    } else {
      result.unshift(node);
    }
  });

  return result;
}

function process_operators(tree, ops) {
  const rhs = [];

  for (let i = tree.length - 1; i >= 0; i--) {
    const node = tree[i];
    if (Array.isArray(node)) {
      rhs.unshift(process_operators(node, ops));
    } else if (node.type == 'op' && ops.includes(node.str)) {
      const lhs = tree.slice(0, i);
      return [process_operators(lhs, ops), node, rhs];
    } else {
      rhs.unshift(node);
    }
  }

  return rhs;
}

function reformat(tree) {
  if (!Array.isArray(tree)) {
    if (tree.type == 'str') {
      return tree.str;
    } else {
      throw 'operator has no operand';
    }
  } else if (tree.length == 0) {
    throw 'empty expression';
  } else if (tree.length == 1) {
    if (Array.isArray(tree[0])) {
      return reformat(tree[0]);
    } else if (tree[0].type == 'str') {
      return tree[0].str;
    } else {
      throw 'operator has no operand';
    }
  } else if (tree.length == 2) {
    if (
      Array.isArray(tree[0]) ||
      tree[0].type != 'op' ||
      (!Array.isArray(tree[1]) && tree[1].type == 'op')
    ) {
      throw 'malformed unary operator';
    }
    return {
      op: tree[0].str,
      args: [reformat(tree[1])],
    };
  } else if (tree.length == 3) {
    if (
      Array.isArray(tree[1]) ||
      tree[1].type != 'op' ||
      (!Array.isArray(tree[0]) && tree[0].type == 'op') ||
      (!Array.isArray(tree[2]) && tree[2].type == 'op')
    ) {
      throw 'malformed binary operator';
    }
    return {
      op: tree[1].str,
      args: [reformat(tree[0]), reformat(tree[2])],
    };
  } else {
    throw 'malformed expression';
  }
}

export async function parse(input) {
  const tokens = tokenise(input);
  let tree = split_by_parens(tokens);
  tree = combine_unary(tree);

  tree = process_operators(tree, ['↔']);
  tree = process_operators(tree, ['←', '→']);
  tree = process_operators(tree, ['∨']);
  tree = process_operators(tree, ['∧']);

  return reformat(tree);
}

export function form_rpn(tree) {
  if (tree instanceof Object) {
    const result = tree.args.map((arg) => form_rpn(arg));
    result.push(tree.op);

    return result.join('');
  } else {
    return tree;
  }
}
