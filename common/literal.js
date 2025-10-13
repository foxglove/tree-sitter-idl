exports.rules = {
  literal: $ =>
    choice(
      $.integer_literal,
      $.floating_pt_literal,
      $.fixed_pt_literal,
      $.char_literal,
      $.wide_character_literal,
      // ROS IDL extension from https://github.com/ros2/rosidl/blob/04bd000e1060d8abe93478a54a63ac96931a1ffa/rosidl_parser/rosidl_parser/grammar.lark#L192-L193
      $.string_literals,
      $.wide_string_literals,
      $.boolean_literal,
    ),
  // 7.2.6.1 Integer Literals
  integer_literal: $ =>
      choice($.bin_number, $.oct_number, $.dec_number, $.hex_number),
  bin_number: _ => /0[bB][01]+/, // extend
  oct_number: _ =>
    choice(
      /0[0-8]+/,
      /0o[0-8]+/, // extend
    ),
  dec_number: _ => choice('0', /[1-9]\d*/),
  hex_number: _ => /0x[0-9a-fA-F]+/i,
  // 7.2.6.4 Floating-point Literals
  // A floating-point literal consists of an integer part, a decimal point (.), a fraction part, an e or E, and an optionally
  // signed integer exponent. The integer and fraction parts both consist of a sequence of decimal (base ten) digits. Either
  // the integer part or the fraction part (but not both) may be missing; either the decimal point or the letter e (or E) and the
  // exponent (but not both) may be missing.
  floating_pt_literal: $ => choice(
    // 1. integer
    // 2. decimal point
    // 3. fraction
    // 4. exponent
    //
    // We must not match any string where both 1 and 3 are missing, or both 2
    // and 4 are missing. Strings where 2 is missing (i.e. no decimal point)
    // should presumably be treated as also missing 3 (i.e. no fraction part),
    // so we must not match any string where both 1 and 2 are missing.
    //
    // Remaining combinations to consider:
    //  - all present
    //  - missing 1
    //  - missing 3
    //  - missing 4
    //  - missing 1 and 4
    //  - missing 2 and 3
    //  - missing 3 and 4
    //
    // Combine some of these using optionals to get. Correctness can be checked
    // by going through each combination above and seeing that it falls into at
    // least one of the patterns below.
    //
    // - 1 and 4 both optional
    /[0-9]*\.[0-9]+((e|E)[+-]?[0-9]+)?/,
    // - 2 optional; missing 3
    /[0-9]+\.?(e|E)[+-]?[0-9]+?/,
    // - missing 3 and 4
    /[0-9]+\./,
  ),
  // 7.2.6.5 Fixed-Point Literals
  fixed_pt_literal: $ =>
    seq($.dec_number, '.', $.dec_number, /d/i),

  escape_sequence: _ =>
    token(
      prec(
        1,
        seq(
          '\\',
          choice(
            /[^xuU]/,
            /\d{2,3}/,
            /x[0-9a-fA-F]{2,}/,
            /u[0-9a-fA-F]{4}/,
            /U[0-9a-fA-F]{8}/,
          ),
        ),
      ),
    ),

  // ROS IDL extension from https://github.com/ros2/rosidl/blob/04bd000e1060d8abe93478a54a63ac96931a1ffa/rosidl_parser/rosidl_parser/grammar.lark#L79-L81
  string_literals: $ => repeat1($.string_literal),
  wide_string_literals: $ => repeat1($.wide_string_literal),

  string_literal: $ =>
    seq(
      '"',
      repeat(
        choice(
          alias(token.immediate(prec(1, /[^\\"\n]+/)), $.string_content),
          $.escape_sequence,
        ),
      ),
      '"',
    ),
  wide_string_literal: $ =>
    seq(
      'L',

      '"',
      repeat(
        choice(
          alias(token.immediate(prec(1, /[^\\"\n]+/)), $.string_content),
          $.escape_sequence,
        ),
      ),
      '"',
    ),
  char_literal: $ =>
    seq(
      "'",
      repeat1(
        choice(
          $.escape_sequence,
          alias(token.immediate(/[^\n']/), $.character),
        ),
      ),
      "'",
    ),
  wide_character_literal: $ =>
    seq(
      'L',
      "'",
      repeat1(
        choice(
          $.escape_sequence,
          alias(token.immediate(/[^\n']/), $.character),
        ),
      ),
      "'",
    ),
  boolean_literal: _ => choice('TRUE', 'FALSE'),
};
