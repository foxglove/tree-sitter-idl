const { commaSep1 } = require('./common');

exports.rules = {
  annotation_dcl: $ =>
    seq(
      token(prec(2, '@annotation')),
      optional($.interface_kind), // DDS_RPC 1.0
      $.identifier,
      '{',
      repeat($.annotation_body),
      '}',
    ),
  annotation_body: $ =>
    choice(
      $.annotation_member,
      seq(choice($.enum_dcl, $.const_dcl, $.typedef_dcl), ';'),
    ),
  annotation_member: $ =>
    seq(
      optional('attribute'), // DDS_RPC 1.0
      $.annotation_member_type,
      $.simple_declarator,
      optional(seq('default', $.const_expr)),
      ';',
    ),
  annotation_member_type: $ =>
    choice($.const_type, $.any_const_type, $.scoped_name),
  any_const_type: _ => 'any',
  // (225) <annotation_appl> ::= "@" <scoped_name> [ "(" <annotation_appl_params> ")" ]
  annotation_appl: $ => seq('@', field('name', $.scoped_name), optional(seq('(', field('params', $.annotation_appl_params), ')'))),
  // (226) <annotation_appl_params> ::= <const_expr>
  //                                  | <annotation_appl_param> { "," <annotation_appl_param> }*
  annotation_appl_params: $ => choice($.const_expr, commaSep1($.annotation_appl_param)),
  // (227) <annotation_appl_param> ::= <identifier> "=" <const_expr>
  annotation_appl_param: $ => seq(field('name', $.identifier), '=', field('value', $.const_expr)),
};