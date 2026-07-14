import { motion } from "framer-motion";
import { CheckCircle, Lightbulb, QrCode, Handshake, Wallet } from "lucide-react";

export function SuaNotaTemValor() {
  return (
    <motion.section
      id="sua-nota-tem-valor"
      className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <motion.p
            className="text-center text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Além das formas de colaboração citadas, você também pode nos apoiar através da campanha Sua Nota Tem Valor, transformando suas notas fiscais em apoio direto aos nossos projetos.
          </motion.p>
        <motion.h2
          className="text-center text-4xl md:text-5xl font-heading font-bold text-primary mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Sua Nota Tem Valor — Transformando Cidadania em Solidariedade
        </motion.h2>
        <motion.p
          className="text-center text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Descubra como suas notas fiscais podem gerar impacto social e apoiar os projetos da Cáritas Diocesana de Sobral.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* O que é o programa */}
          <motion.div
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-100"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <QrCode className="w-10 h-10 text-primary" />
              <h3 className="text-2xl font-semibold text-gray-800">O que é o programa “Sua Nota Tem Valor”?</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              O “Sua Nota Tem Valor” é uma iniciativa da Secretaria da Fazenda do Estado do Ceará (SEFAZ-CE) que estimula a cidadania fiscal e a participação popular no controle e na aplicação dos recursos públicos. Ao cadastrar o CPF no momento da compra e escolher uma instituição sem fins lucrativos para apoiar, o cidadão passa a concorrer a prêmios em dinheiro mensais, enquanto sua instituição escolhida também concorre a premiações e recebe apoio por meio do rateio de pontos gerados pelas notas fiscais.
            </p>
          </motion.div>

          {/* Como funciona o programa */}
          <motion.div
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-100"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Lightbulb className="w-10 h-10 text-primary" />
              <h3 className="text-2xl font-semibold text-gray-800">Como funciona o programa</h3>
            </div>
            <ul className="space-y-4 text-gray-600 leading-relaxed">
              <li>
                <span className="font-semibold text-gray-800">Cadastro:</span> O cidadão se cadastra gratuitamente no site oficial Sua Nota Tem Valor ou pelo aplicativo disponível para Android e iOS.
              </li>
              <li>
                <span className="font-semibold text-gray-800">Indicação de instituição:</span> Durante o cadastro, o participante escolhe uma instituição sem fins lucrativos cadastrada no programa — é aqui que a Cáritas pode ser incluída como instituição apoiada!
              </li>
              <li>
                <span className="font-semibold text-gray-800">Acúmulo de pontos:</span> Ao informar o CPF na nota fiscal eletrônica (NF-e, NFC-e ou CF-e), o cidadão acumula pontos — cada R$ 50,00 em compras gera um ponto convertido em bilhete para concorrer nos sorteios.
              </li>
              <li>
                <span className="font-semibold text-gray-800">Sorteios e rateios:</span> O programa promove sorteios mensais com prêmios em dinheiro tanto para pessoas quanto para instituições apoiadas, e ainda distribui parte do valor arrecadado entre as instituições com maior engajamento social.
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Por que participar? */}
        <motion.div
          className="mt-16 bg-white p-8 rounded-lg shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Handshake className="w-10 h-10 text-primary" />
            <h3 className="text-2xl font-semibold text-gray-800">Por que participar?</h3>
          </div>
          <ul className="space-y-4 text-gray-600 leading-relaxed">
            <li>
              <CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" />
              <span className="font-semibold text-gray-800">Fortalece a cidadania fiscal:</span> Ao exigir nota fiscal com CPF, você contribui para uma arrecadação mais justa e transparente — fortalecendo políticas públicas e serviços para toda a sociedade.
            </li>
            <li>
              <CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" />
              <span className="font-semibold text-gray-800">Gera solidariedade:</span> Cada nota emitida com seu CPF fortalece não apenas você, por meio da chance de ganhar prêmios, mas também a instituição que você apoia, como a Cáritas, que recebe mais pontos e tem mais chances de ser beneficiada nos rateios.
            </li>
            <li>
              <CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" />
              <span className="font-semibold text-gray-800">Beneficia a Cáritas:</span> Quando o visitante escolhe a Cáritas como instituição apoiada, cada compra com o CPF informado fortalece diretamente nosso trabalho social e nossos projetos comunitários.
            </li>
          </ul>
        </motion.div>

        {/* Como se cadastrar e apoiar a Cáritas */}
        <motion.div
          className="mt-16 bg-white p-8 rounded-lg shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Wallet className="w-10 h-10 text-primary" />
            <h3 className="text-2xl font-semibold text-gray-800">Como se cadastrar e apoiar a Cáritas</h3>
          </div>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800">👉 Passo a passo:</p>
            <ul className="list-decimal list-inside space-y-2">
              <li>Acesse o site do programa: <a href="https://suanotatemvalor.sefaz.ce.gov.br/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://suanotatemvalor.sefaz.ce.gov.br/</a></li>
              <li>Clique em “Cadastre-se” ou baixe o aplicativo “Sua Nota Tem Valor”.</li>
              <li>Preencha seus dados e no momento de escolher uma instituição, selecione “Cáritas Diocesana de Sobral” como a organização que você deseja apoiar.</li>
              <li>Em todas as suas compras, exija a nota fiscal e informe seu CPF para acumular pontos que contarão tanto para os sorteios quanto para ajudar a Cáritas!</li>
            </ul>
            <p className="font-semibold text-gray-800">💡 Dica:</p>
            <p>Compartilhe essa iniciativa com amigos e familiares — quanto mais pessoas cadastrarem a Cáritas como instituição apoiada, mais chances teremos de receber recursos importantes para nossos projetos de impacto social.</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
