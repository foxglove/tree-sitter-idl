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
    seq(
      optional($.integer_sign),
      choice($.bin_number, $.oct_number, $.dec_number, $.hex_number),
    ),
  integer_sign: _ => choice('-', '+'),
  bin_number: _ => /0[bB][01]+/, // extend
  oct_number: _ =>
    choice(
      /0[0-8]+/,
      /0o[0-8]+/, // extend
    ),
  dec_number: _ => choice('0', /[1-9]\d*/),
  hex_number: _ => /0x[0-9a-fA-F]+/i,
  // 7.2.6.4 Floating-point Literals
  floating_pt_literal: $ =>
    seq(
      optional($.integer_sign),
      $.dec_number,
      '.',
      $.dec_number,
      optional(/e/i),
    ),
  // 7.2.6.5 Fixed-Point Literals
  fixed_pt_literal: $ =>
    seq(optional($.integer_sign), $.dec_number, '.', $.dec_number, /d/i),

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
