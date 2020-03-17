const sep = '/';
const _replaceRegex = new RegExp('//+', 'g');

function _removeDuplicateSeps(p) {
  p = p.replace(_replaceRegex, sep);
  return p;
}

export function normalize(p) {
  // Special case: '' -> '.'
  if (p === '') {
    p = '.';
  }
  // It's very important to know if the path is relative or not, since it
  // changes how we process .. and reconstruct the split string.
  var absolute = p.charAt(0) === sep;
  // Remove repeated //s
  p = _removeDuplicateSeps(p);
  // Try to remove as many '../' as possible, and remove '.' completely.
  var components = p.split(sep);
  var goodComponents = [];
  for (var idx = 0; idx < components.length; idx++) {
    var c = components[idx];
    if (c === '.') {
      continue;
    } else if (
      c === '..' &&
      (absolute ||
        (!absolute && goodComponents.length > 0 && goodComponents[0] !== '..'))
    ) {
      // In the absolute case: Path is relative to root, so we may pop even if
      // goodComponents is empty (e.g. /../ => /)
      // In the relative case: We're getting rid of a directory that preceded
      // it (e.g. /foo/../bar -> /bar)
      goodComponents.pop();
    } else {
      goodComponents.push(c);
    }
  }
  // Add in '.' when it's a relative path with no other nonempty components.
  // Possible results: '.' and './' (input: [''] or [])
  // @todo Can probably simplify this logic.
  if (!absolute && goodComponents.length < 2) {
    switch (goodComponents.length) {
      case 1:
        if (goodComponents[0] === '') {
          goodComponents.unshift('.');
        }
        break;
      default:
        goodComponents.push('.');
    }
  }
  p = goodComponents.join(sep);
  if (absolute && p.charAt(0) !== sep) {
    p = sep + p;
  }
  return p;
}

export function join(...paths) {
  // Required: Prune any non-strings from the path. I also prune empty segments
  // so we can do a simple join of the array.
  var processed = [];
  for (var i = 0; i < paths.length; i++) {
    var segment = paths[i];
    if (typeof segment !== 'string') {
      throw new TypeError(
        'Invalid argument type to path.join: ' + typeof segment
      );
    } else if (segment !== '') {
      processed.push(segment);
    }
  }
  return normalize(processed.join(sep));
}
