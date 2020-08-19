import React, { useState, useEffect } from 'react';
import { format, utcToZonedTime } from 'date-fns-tz';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<{
        transactions: Transaction[];
        balance: Balance;
      }>('/transactions');

      const { transactions, balance } = response.data;

      const trans = transactions.map(transaction => {
        if (transaction.type === 'outcome') {
          transaction.formattedValue = `- ${formatValue(transaction.value)}`;
        } else {
          transaction.formattedValue = formatValue(transaction.value);
        }

        const date = transaction.created_at;
        const timeZone = 'America/Sao_Paulo';
        const zonedDate = utcToZonedTime(date, timeZone);

        transaction.formattedDate = format(zonedDate, 'dd/MM/yyyy', {
          timeZone: 'America/Sao_Paulo',
        });

        return transaction;
      });

      balance.income = formatValue(Number(balance.income));
      balance.outcome = formatValue(Number(balance.outcome));
      balance.total = formatValue(Number(balance.total));

      setTransactions(trans);
      setBalance(balance);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Value</th>
                <th>Type</th>
                <th>Category</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className="income">{transaction.formattedValue}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.category.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
