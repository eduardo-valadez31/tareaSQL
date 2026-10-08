import { Request, Response } from 'express';
import { pool } from '../conf/dbConnection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ProductController {

  // GET /getAll - Consulta solo productos donde active = TRUE
  public getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, price, stock, description, brand, img, active FROM products WHERE active = TRUE'
      );
      res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener productos' });
    }
  };

  // GET /getById/:id - Obtiene un producto activo por su ID
  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    // Validación de ID entero positivo
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ status: 'fail', message: 'El ID proporcionado debe ser un número entero positivo' });
      return;
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, price, stock, description, brand, img, active FROM products WHERE id = ? AND active = TRUE',
        [id]
      );

      if (rows.length === 0) {
        res.status(404).json({ status: 'fail', message: 'Producto no encontrado o inactivo' });
        return;
      }

      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al consultar la base de datos' });
    }
  };

  // POST /create - Crea un nuevo producto
  public create = async (req: Request, res: Response): Promise<void> => {
    const { name, price, stock, description, brand, img } = req.body;

    // Validación de campos obligatorios
    if (!name || price === undefined || stock === undefined || !description) {
      res.status(400).json({ status: 'fail', message: 'Los campos name, price, stock y description son obligatorios' });
      return;
    }

    // Validación estricta del precio
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ status: 'fail', message: 'El precio debe ser un número mayor a cero' });
      return;
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)',
        [name, numericPrice, stock, description, brand || null, img || null]
      );

      res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: { id: result.insertId, name, price: numericPrice, stock, description, brand, img, active: true }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al registrar el producto' });
    }
  };

  // PUT /update/:id - Actualización completa de un producto activo
  public update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { name, price, stock, description, brand, img } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ status: 'fail', message: 'El ID debe ser un número entero positivo' });
      return;
    }

    if (!name || price === undefined || stock === undefined || !description) {
      res.status(400).json({ status: 'fail', message: 'Faltan campos obligatorios para actualizar' });
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ status: 'fail', message: 'El precio debe ser un número numérico mayor a 0' });
      return;
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE products 
         SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? 
         WHERE id = ? AND active = TRUE`,
        [name, numericPrice, stock, description, brand || null, img || null, id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ status: 'fail', message: 'Producto no existe o está inactivo' });
        return;
      }

      res.status(200).json({ status: 'success', message: 'Producto actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al actualizar el producto' });
    }
  };

  // DELETE /delete/:id - Baja Lógica (active = FALSE)
  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ status: 'fail', message: 'El ID debe ser un entero positivo' });
      return;
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        'UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE',
        [id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ status: 'fail', message: 'Producto no encontrado o ya fue dado de baja' });
        return;
      }

      res.status(200).json({ status: 'success', message: 'Producto dado de baja lógicamente' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al procesar la baja lógica' });
    }
  };

  // PATCH /change-price/:id - Modificación exclusiva de precio
  public changePrice = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { price } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ status: 'fail', message: 'El ID debe ser un entero positivo' });
      return;
    }

    const numericPrice = Number(price);
    if (price === undefined || isNaN(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ status: 'fail', message: 'Debe enviar un precio válido y mayor a 0' });
      return;
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        'UPDATE products SET price = ? WHERE id = ? AND active = TRUE',
        [numericPrice, id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ status: 'fail', message: 'Producto no encontrado o inactivo' });
        return;
      }

      res.status(200).json({ status: 'success', message: 'Precio modificado correctamente' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al actualizar el precio' });
    }
  };
}